<?php
defined('ABSPATH') || exit;
require_once get_theme_file_path('/languages.php');

add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('html5', array('search-form', 'gallery', 'caption', 'style', 'script'));
    // Imported layouts contain complete HTML; automatic paragraphs break grid children.
    remove_filter('the_content', 'wpautop');
    add_filter('the_content', function ($content) {
        return get_post_meta(get_the_ID(), '_wugan_layout', true) || has_blocks($content) ? $content : wpautop($content);
    });
});
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('wugan-second', get_theme_file_uri('/assets/second.css'), array('wugan-editorial'), filemtime(get_theme_file_path('/assets/second.css')));
    wp_enqueue_style('wugan-editorial', get_theme_file_uri('/assets/editorial.css'), array('wugan-site'), filemtime(get_theme_file_path('/assets/editorial.css')));
    wp_enqueue_script('wugan-icons', get_theme_file_uri('/assets/lucide.min.js'), array(), '0.468', true);
    foreach (array('css', 'js') as $ext) {
        $path = '/assets/site.' . $ext;
        $version = file_exists(get_theme_file_path($path)) ? filemtime(get_theme_file_path($path)) : '1.0.0';
        if ('css' === $ext) {
            wp_enqueue_style('wugan-site', get_theme_file_uri($path), array(), $version);
        } else {
            wp_enqueue_script('wugan-site', get_theme_file_uri($path), array('wugan-icons'), $version, true);
        }
    }
});
add_action('init', function () {
    register_post_type('wugan_product', array(
        'labels' => array('name' => __('Products', 'wugan-studio'), 'singular_name' => __('Product', 'wugan-studio')),
        'public' => true, 'show_in_rest' => true, 'menu_icon' => 'dashicons-products',
        'has_archive' => false, 'rewrite' => array('slug' => 'product'),
        'supports' => array('title', 'editor', 'excerpt', 'thumbnail', 'revisions'),
    ));
    register_taxonomy('wugan_category', 'wugan_product', array(
        'labels' => array('name' => __('Product categories', 'wugan-studio'), 'singular_name' => __('Product category', 'wugan-studio')),
        'public' => true, 'hierarchical' => true, 'show_in_rest' => true,
        'rewrite' => array('slug' => 'product-category'),
    ));
});

function wugan_expand_content($content) {
    return str_replace(array('{{asset}}', '{{home}}'), array(esc_url(untrailingslashit(get_theme_file_uri('/assets'))), esc_url(untrailingslashit(home_url('/')))), $content);
}
add_filter('the_content', 'wugan_expand_content', 9);

function wugan_page_image_sources($content) {
    $processor = new WP_HTML_Tag_Processor(wugan_expand_content($content));
    $sources = array();
    while ($processor->next_tag('IMG')) {
        $src = $processor->get_attribute('src');
        if (is_string($src) && $src) { $sources[md5($src)] = $src; }
    }
    return $sources;
}

add_filter('the_content', function ($content) {
    if ('page' !== get_post_type()) { return $content; }
    $replacements = get_post_meta(get_the_ID(), '_wugan_page_images', true);
    if (!is_array($replacements) || !$replacements) { return $content; }
    $processor = new WP_HTML_Tag_Processor(wugan_expand_content($content));
    while ($processor->next_tag('IMG')) {
        $src = $processor->get_attribute('src');
        $id = is_string($src) ? ($replacements[md5($src)] ?? 0) : 0;
        $image = $id ? wp_get_attachment_image_src($id, 'full') : false;
        if (!$image) { continue; }
        $processor->set_attribute('src', $image[0]);
        $processor->set_attribute('alt', get_post_meta($id, '_wp_attachment_image_alt', true));
        $processor->set_attribute('width', $image[1]);
        $processor->set_attribute('height', $image[2]);
        $processor->remove_attribute('srcset');
        $processor->remove_attribute('sizes');
    }
    return $processor->get_updated_html();
}, 10);

add_action('pre_get_posts', function ($query) {
    if (is_admin() || !$query->is_main_query()) { return; }
    if ($query->is_search()) { $query->set('post_type', 'wugan_product'); }
    if ($query->is_post_type_archive('wugan_product') || $query->is_search()) {
        $category = isset($_GET['category']) && is_string($_GET['category']) ? sanitize_title(wp_unslash($_GET['category'])) : '';
        if ($category) { $query->set('tax_query', array(array('taxonomy' => 'wugan_category', 'field' => 'slug', 'terms' => $category))); }
        $query->set('posts_per_page', 12);
    }
});
add_filter('template_include', function ($template) {
    return is_tax('wugan_category') || is_search() ? get_theme_file_path('/archive-wugan_product.php') : $template;
});
add_filter('posts_search', function ($search, $query) {
    global $wpdb;
    $term = trim((string) $query->get('s'));
    if (is_admin() || 'wugan_product' !== $query->get('post_type') || !preg_match('/^[a-z]{1,4}[0-9]{3,6}$/i', $term)) { return $search; }
    $search = $wpdb->prepare(" AND EXISTS (SELECT 1 FROM {$wpdb->postmeta} sku WHERE sku.post_id = {$wpdb->posts}.ID AND sku.meta_key = '_wugan_code' AND sku.meta_value = %s)", strtoupper($term));
    if (!is_user_logged_in()) { $search .= " AND {$wpdb->posts}.post_password = ''"; }
    return $search;
}, 10, 2);

add_action('wp_head', function () {
    if (!is_front_page()) { return; }
    $organization = array('@context' => 'https://schema.org', '@type' => 'Organization', 'name' => 'WUGAN', 'url' => home_url('/'), 'logo' => get_theme_file_uri('/assets/logo.png'), 'email' => 'sales@wugan.net', 'telephone' => '+86-13692352052');
    echo '<script type="application/ld+json">' . wp_json_encode($organization, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) . '</script>';
});

function wugan_product_card() {
    $terms = wp_get_post_terms(get_the_ID(), 'wugan_category', array('fields' => 'slugs'));
    ?>
    <article class="product-card" data-category="<?php echo esc_attr(is_wp_error($terms) ? '' : implode(' ', $terms)); ?>"><a href="<?php the_permalink(); ?>">
        <div class="product-image"><?php the_post_thumbnail('large', array('loading' => 'lazy')); ?></div>
        <div class="product-card-body"><p class="eyebrow"><?php echo esc_html(get_post_meta(get_the_ID(), '_wugan_code', true)); ?></p><h2><?php the_title(); ?></h2></div>
    </a></article>
    <?php
}

function wugan_catalogue($query = null, $category = '') {
    $selected = isset($_GET['category']) && is_string($_GET['category']) ? sanitize_title(wp_unslash($_GET['category'])) : $category;
    $search = isset($_GET['s']) && is_string($_GET['s']) ? sanitize_text_field(wp_unslash($_GET['s'])) : '';
    $shortcode = !$query;
    $current = $shortcode ? (isset($_GET['catalog_page']) && is_scalar($_GET['catalog_page']) ? max(1, absint($_GET['catalog_page'])) : 1) : max(1, get_query_var('paged'));
    if (!$query) {
        $args = array('post_type' => 'wugan_product', 'post_status' => 'publish', 'posts_per_page' => 12, 'paged' => $current, 's' => $search);
        if ($selected) { $args['tax_query'] = array(array('taxonomy' => 'wugan_category', 'field' => 'slug', 'terms' => $selected)); }
        $query = new WP_Query($args);
    }
    ?>
    <section class="section catalogue" aria-label="Product catalogue"><div class="container">
    <form class="catalogue-filters" method="get" action="<?php echo esc_url(home_url('/')); ?>">
        <input type="hidden" name="post_type" value="wugan_product">
        <label>Search products <input type="search" name="s" value="<?php echo esc_attr($search); ?>" placeholder="Search products"></label>
        <label>Category <select name="category"><option value="">All products</option>
        <?php $terms = get_terms(array('taxonomy' => 'wugan_category', 'hide_empty' => false));
        if (!is_wp_error($terms)) { foreach ($terms as $term) { ?>
            <option value="<?php echo esc_attr($term->slug); ?>" <?php selected($selected, $term->slug); ?>><?php echo esc_html($term->name); ?></option>
        <?php } } ?></select></label><button class="button" type="submit">Search</button>
    </form><div class="product-grid">
    <?php if ($query->have_posts()) : while ($query->have_posts()) : $query->the_post(); ?>
        <?php wugan_product_card(); ?>
    <?php endwhile; else : ?><p class="empty-state">No products found.</p><?php endif; ?>
    </div><nav class="pagination" aria-label="Product pages"><?php
    $pagination = array('total' => $query->max_num_pages, 'current' => $current);
    if ($shortcode) { $pagination['base'] = str_replace('999999999', '%#%', esc_url(add_query_arg('catalog_page', 999999999))); $pagination['format'] = ''; }
    echo wp_kses_post(paginate_links($pagination));
    ?></nav>
    </div></section>
    <?php wp_reset_postdata();
}

add_shortcode('wugan_catalog', function ($attributes) {
    $attributes = shortcode_atts(array('category' => ''), $attributes, 'wugan_catalog');
    ob_start();
    wugan_catalogue(null, sanitize_title($attributes['category']));
    return ob_get_clean();
});

function wugan_product_grid($args) {
    $query = new WP_Query(array_merge(array('post_type' => 'wugan_product', 'post_status' => 'publish', 'posts_per_page' => 4, 'no_found_rows' => true, 'ignore_sticky_posts' => true, 'orderby' => 'title', 'order' => 'ASC'), $args));
    ob_start();
    if ($query->have_posts()) {
        echo '<div class="product-grid">';
        while ($query->have_posts()) { $query->the_post(); wugan_product_card(); }
        echo '</div>';
    }
    wp_reset_postdata();
    return ob_get_clean();
}

add_shortcode('wugan_featured', function ($attributes) {
    $attributes = shortcode_atts(array('limit' => 4, 'category' => ''), $attributes, 'wugan_featured');
    $args = array('posts_per_page' => min(12, max(1, absint($attributes['limit']))));
    if ($attributes['category']) { $args['tax_query'] = array(array('taxonomy' => 'wugan_category', 'field' => 'slug', 'terms' => sanitize_title($attributes['category']))); }
    return wugan_product_grid($args);
});

add_action('wp_head', function () {
    if (!is_singular(array('page', 'wugan_product'))) { return; }
    $id = get_queried_object_id();
    $description = get_post_meta($id, '_wugan_description', true);
    if (!$description && 'wugan_product' === get_post_type($id)) {
        $description = wp_trim_words(wp_strip_all_tags(strip_shortcodes(get_post_field('post_content', $id))), 32, '...');
    }
    if ($description) { echo '<meta name="description" content="' . esc_attr(wp_strip_all_tags($description)) . '">' . "\n"; }
});

add_action('admin_enqueue_scripts', function () {
    $screen = get_current_screen();
    if (!$screen || 'post' !== $screen->base || !in_array($screen->post_type, array('page', 'wugan_product'), true)) { return; }
    wp_enqueue_media();
    wp_add_inline_script('media-editor', <<<'JS'
document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-wugan-image-select], [data-wugan-image-reset]');
    if (!button) return;
    var field = button.closest('.wugan-page-image');
    var input = field.querySelector('input');
    var image = field.querySelector('img');
    if (button.hasAttribute('data-wugan-image-reset')) {
        input.value = ''; image.src = image.dataset.original; return;
    }
    var frame = wp.media({title: 'Choose page image', button: {text: 'Use image'}, library: {type: 'image'}, multiple: false});
    frame.on('select', function () {
        var attachment = frame.state().get('selection').first().toJSON();
        input.value = attachment.id;
        image.src = attachment.sizes && attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url;
    });
    frame.open();
});
JS
    );
    wp_add_inline_script('media-editor', <<<'JS'
document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('wugan-gallery');
    var preview = document.getElementById('wugan-gallery-preview');
    if (!input || !preview) return;
    var ids;
    try { ids = JSON.parse(input.value).filter(function (id) { return Number.isInteger(id) && id > 0; }); } catch (error) { ids = []; }
    function render() {
        input.value = JSON.stringify(ids);
        preview.replaceChildren();
        ids.forEach(function (id, index) {
            var row = document.createElement('li');
            var image = document.createElement('img');
            image.width = 90; image.height = 90; image.style.objectFit = 'cover';
            row.appendChild(image);
            var attachment = wp.media.attachment(id);
            function show() {
                var data = attachment.toJSON();
                image.src = data.sizes && data.sizes.thumbnail ? data.sizes.thumbnail.url : data.url;
                image.alt = data.alt || data.title || 'Gallery image';
            }
            if (attachment.get('url')) show(); else attachment.fetch().done(show);
            [['Move earlier', -1], ['Move later', 1], ['Remove', 0]].forEach(function (action) {
                var button = document.createElement('button');
                button.type = 'button'; button.className = 'button'; button.textContent = action[0];
                button.disabled = (action[1] === -1 && index === 0) || (action[1] === 1 && index === ids.length - 1);
                button.addEventListener('click', function () {
                    if (!action[1]) ids.splice(index, 1);
                    else { var target = index + action[1]; var other = ids[target]; ids[target] = ids[index]; ids[index] = other; }
                    render();
                    var next = preview.querySelector('button');
                    (next || document.getElementById('wugan-gallery-select')).focus();
                });
                row.appendChild(button);
            });
            preview.appendChild(row);
        });
    }
    render();
    document.getElementById('wugan-gallery-select').addEventListener('click', function () {
        var frame = wp.media({title: 'Select product gallery images', button: {text: 'Add to gallery'}, library: {type: 'image'}, multiple: true});
        frame.on('select', function () {
            frame.state().get('selection').each(function (attachment) {
                if (ids.indexOf(attachment.id) === -1) ids.push(attachment.id);
            });
            render();
        });
        frame.open();
    });
});
JS
    );
});

add_action('add_meta_boxes', function () {
    add_meta_box('wugan-specifications', 'Product development specifications', function ($post) {
        wp_nonce_field('wugan_save_specs', 'wugan_specs_nonce');
        foreach (array('fabric' => 'Material direction', 'fit' => 'Fit / silhouette', 'construction' => 'Construction details') as $key => $label) {
            echo '<p><label>' . esc_html($label) . '<input class="widefat" name="wugan_' . esc_attr($key) . '" value="' . esc_attr(get_post_meta($post->ID, '_wugan_' . $key, true)) . '"></label></p>';
        }
    }, 'wugan_product', 'normal');
    add_meta_box('wugan-page-images', 'Page images', function ($post) {
        wp_nonce_field('wugan_save_page_images', 'wugan_page_images_nonce');
        $replacements = get_post_meta($post->ID, '_wugan_page_images', true);
        foreach (wugan_page_image_sources($post->post_content) as $key => $source) {
            $id = is_array($replacements) ? ($replacements[$key] ?? 0) : 0;
            $preview = $id ? wp_get_attachment_image_url($id, 'thumbnail') : $source;
            ?><div class="wugan-page-image"><p><img src="<?php echo esc_url($preview ?: $source); ?>" data-original="<?php echo esc_url($source); ?>" alt="<?php echo esc_attr(wp_basename($source)); ?>" width="120" style="height:90px;object-fit:cover"></p><input type="hidden" name="wugan_page_images[<?php echo esc_attr($key); ?>]" value="<?php echo esc_attr($id); ?>"><button type="button" class="button" data-wugan-image-select>Replace image</button> <button type="button" class="button" data-wugan-image-reset>Use original</button></div><?php
        }
    }, 'page', 'normal');
    add_meta_box('wugan-details', 'Product details', function ($post) {
        wp_nonce_field('wugan_save_product', 'wugan_product_nonce');
        echo '<p><label for="wugan-code">Product code</label><br><input class="widefat" id="wugan-code" name="wugan_code" value="' . esc_attr(get_post_meta($post->ID, '_wugan_code', true)) . '"></p>';
        echo '<h3>Product gallery</h3><input type="hidden" id="wugan-gallery" name="wugan_gallery" value="' . esc_attr(get_post_meta($post->ID, '_wugan_gallery', true) ?: '[]') . '"><ul id="wugan-gallery-preview" aria-label="Gallery images"></ul><button type="button" class="button" id="wugan-gallery-select">Add gallery images</button>';
    }, 'wugan_product', 'normal');
    add_meta_box('wugan-description', 'Search description', function ($post) {
        wp_nonce_field('wugan_save_description', 'wugan_description_nonce');
        echo '<label for="wugan-description-field">Search engine description</label><textarea class="widefat" rows="3" id="wugan-description-field" name="wugan_description">' . esc_textarea(get_post_meta($post->ID, '_wugan_description', true)) . '</textarea>';
    }, array('page', 'wugan_product'), 'normal');
});
add_action('save_post_page', function ($id) {
    if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || wp_is_post_revision($id) || !current_user_can('edit_post', $id)) { return; }
    if (!isset($_POST['wugan_page_images_nonce']) || !is_string($_POST['wugan_page_images_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['wugan_page_images_nonce'])), 'wugan_save_page_images')) { return; }
    $submitted = isset($_POST['wugan_page_images']) && is_array($_POST['wugan_page_images']) ? wp_unslash($_POST['wugan_page_images']) : array();
    $clean = array();
    foreach (wugan_page_image_sources(get_post_field('post_content', $id)) as $key => $source) {
        $attachment = isset($submitted[$key]) && is_scalar($submitted[$key]) ? absint($submitted[$key]) : 0;
        if ($attachment && wp_attachment_is_image($attachment)) { $clean[$key] = $attachment; }
    }
    update_post_meta($id, '_wugan_page_images', $clean);
});
add_action('save_post', function ($id) {
    if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || wp_is_post_revision($id) || !current_user_can('edit_post', $id) || !in_array(get_post_type($id), array('page', 'wugan_product'), true)) { return; }
    if (!isset($_POST['wugan_description_nonce'], $_POST['wugan_description']) || !is_string($_POST['wugan_description_nonce']) || !is_string($_POST['wugan_description']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['wugan_description_nonce'])), 'wugan_save_description')) { return; }
    update_post_meta($id, '_wugan_description', sanitize_textarea_field(wp_unslash($_POST['wugan_description'])));
});
add_action('save_post_wugan_product', function ($id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE || wp_is_post_revision($id) || !current_user_can('edit_post', $id)) { return; }
    if (isset($_POST['wugan_specs_nonce']) && is_string($_POST['wugan_specs_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['wugan_specs_nonce'])), 'wugan_save_specs')) {
        foreach (array('fabric', 'fit', 'construction') as $key) {
            if (isset($_POST['wugan_' . $key]) && is_string($_POST['wugan_' . $key])) { update_post_meta($id, '_wugan_' . $key, sanitize_text_field(wp_unslash($_POST['wugan_' . $key]))); }
        }
    }
    if (!isset($_POST['wugan_product_nonce']) || !is_string($_POST['wugan_product_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['wugan_product_nonce'])), 'wugan_save_product')) { return; }
    if (isset($_POST['wugan_code']) && is_string($_POST['wugan_code'])) { update_post_meta($id, '_wugan_code', sanitize_text_field(wp_unslash($_POST['wugan_code']))); }
    if (isset($_POST['wugan_gallery']) && is_string($_POST['wugan_gallery'])) {
        $gallery = json_decode(wp_unslash($_POST['wugan_gallery']), true);
        if (!is_array($gallery) || array_values($gallery) !== $gallery) { return; }
        $clean = array();
        foreach ($gallery as $image) {
            if (is_numeric($image) && wp_attachment_is_image(absint($image))) { $clean[] = absint($image); }
        }
        update_post_meta($id, '_wugan_gallery', wp_json_encode($clean));
    }
});

function wugan_import_image($source, $parent = 0) {
    if (!is_string($source) || !$source) { return 0; }
    $relative = ltrim(str_replace('{{asset}}', '', $source), '/');
    if (0 === strpos($relative, 'assets/')) { $relative = substr($relative, 7); }
    $root = realpath(get_theme_file_path('/assets'));
    $path = $root ? realpath($root . '/' . $relative) : false;
    if (!$path || 0 !== strpos($path, $root . DIRECTORY_SEPARATOR) || !is_file($path)) { return 0; }
    $existing = get_posts(array('post_type' => 'attachment', 'post_status' => 'inherit', 'meta_key' => '_wugan_source', 'meta_value' => $relative, 'fields' => 'ids', 'numberposts' => 1));
    if ($existing) { return $existing[0]; }
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';
    if (!wp_get_image_mime($path)) { return 0; }
    $temp = wp_tempnam(basename($path));
    if (!$temp || !copy($path, $temp)) { if ($temp) { wp_delete_file($temp); } return 0; }
    $id = media_handle_sideload(array('name' => basename($path), 'tmp_name' => $temp), $parent);
    if (is_wp_error($id)) { wp_delete_file($temp); return 0; }
    add_post_meta($id, '_wugan_source', $relative, true);
    update_post_meta($id, '_wp_attachment_image_alt', get_the_title($parent) ?: pathinfo($path, PATHINFO_FILENAME));
    return $id;
}

add_action('admin_menu', function () {
    add_theme_page('Wugan setup', 'Wugan setup', 'manage_options', 'wugan-setup', function () {
        ?><div class="wrap"><h1>Wugan setup</h1><p>Second Scheme v<?php echo esc_html(wp_get_theme()->get('Version')); ?></p><p>Add missing pages, products and media. Existing content is preserved unless you explicitly select the release upgrade below. Back up your database and test on staging first.</p>
        <?php if (isset($_GET['complete'])) { ?><div class="notice notice-success"><p>Setup finished. Existing content was preserved. Review Pages, Products, and Settings &gt; Reading.</p></div><?php } ?>
        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>"><input type="hidden" name="action" value="wugan_setup"><?php wp_nonce_field('wugan_setup'); ?><p><label><input type="checkbox" name="upgrade_release" value="1"> Replace the bundled pages with this release. Current content and descriptions are backed up in post metadata; WordPress revisions are also saved. This replaces edits on matching pages, not products or inquiries.</label></p><?php submit_button('Import selected content'); ?></form></div><?php
    });
});
add_action('admin_post_wugan_setup', function () {
    if (!current_user_can('manage_options') || !current_user_can('edit_pages') || !current_user_can('upload_files')) { wp_die('Insufficient permissions.'); }
    check_admin_referer('wugan_setup');
    $file = get_theme_file_path('/data/site.json');
    $data = is_readable($file) ? json_decode(file_get_contents($file), true) : null;
    if (!is_array($data) || !isset($data['pages'], $data['products']) || !is_array($data['pages']) || !is_array($data['products'])) { wp_die('The theme data/site.json file is missing or invalid.'); }
    $upgrade = isset($_POST['upgrade_release']) && '1' === $_POST['upgrade_release'];
    foreach ($data['pages'] as $slug => $page) {
        if (!is_array($page) || !isset($page['title'], $page['content'])) { continue; }
        $existing = get_page_by_path(sanitize_title($slug), OBJECT, array('page'));
        if ($existing) {
            if (!$upgrade) { continue; }
            add_post_meta($existing->ID, '_wugan_release_backup', wp_slash(array('at' => gmdate('c'), 'release' => wp_get_theme()->get('Version'), 'title' => $existing->post_title, 'content' => $existing->post_content, 'description' => get_post_meta($existing->ID, '_wugan_description', true), 'images' => get_post_meta($existing->ID, '_wugan_page_images', true))));
            wp_save_post_revision($existing->ID);
            $updated = wp_update_post(wp_slash(array('ID' => $existing->ID, 'post_title' => sanitize_text_field($page['title']), 'post_content' => wp_kses_post(wugan_expand_content($page['content'])))), true);
            if (is_wp_error($updated)) { wp_die(esc_html($updated->get_error_message())); }
            update_post_meta($existing->ID, '_wugan_description', sanitize_text_field($page['description'] ?? ''));
            update_post_meta($existing->ID, '_wugan_layout', 'editorial-2');
            continue;
        }
        $id = wp_insert_post(wp_slash(array('post_type' => 'page', 'post_status' => 'publish', 'post_name' => sanitize_title($slug), 'post_title' => sanitize_text_field($page['title']), 'post_content' => wp_kses_post(wugan_expand_content($page['content'])))), true);
        if (is_wp_error($id)) { wp_die(esc_html($id->get_error_message())); }
        add_post_meta($id, '_wugan_description', sanitize_text_field($page['description'] ?? ''), true);
        update_post_meta($id, '_wugan_layout', 'editorial-2');
        if ('privacy' === $slug && (!get_option('wp_page_for_privacy_policy') || 'publish' !== get_post_status(get_option('wp_page_for_privacy_policy')))) { update_option('wp_page_for_privacy_policy', $id); }
        if ('home' === $slug && !get_option('page_on_front') && 'posts' === get_option('show_on_front')) { update_option('page_on_front', $id); update_option('show_on_front', 'page'); }
    }
    foreach ($data['products'] as $product) {
        if (!is_array($product) || empty($product['slug']) || empty($product['title'])) { continue; }
        $existing_product = get_page_by_path(sanitize_title($product['slug']), OBJECT, array('wugan_product'));
        if ($existing_product) {
            foreach (array('fabric', 'fit', 'construction') as $key) {
                if (!metadata_exists('post', $existing_product->ID, '_wugan_' . $key)) { add_post_meta($existing_product->ID, '_wugan_' . $key, sanitize_text_field($product[$key] ?? ''), true); }
            }
            continue;
        }
        $id = wp_insert_post(wp_slash(array('post_type' => 'wugan_product', 'post_status' => 'publish', 'post_name' => sanitize_title($product['slug']), 'post_title' => sanitize_text_field($product['title']), 'post_content' => wp_kses_post(wugan_expand_content($product['description'] ?? '')))), true);
        if (is_wp_error($id)) { wp_die(esc_html($id->get_error_message())); }
        if (!empty($product['category'])) { wp_set_object_terms($id, sanitize_text_field($product['category']), 'wugan_category'); }
        add_post_meta($id, '_wugan_code', sanitize_text_field($product['code'] ?? ''), true);
        foreach (array('fabric', 'fit', 'construction') as $key) { add_post_meta($id, '_wugan_' . $key, sanitize_text_field($product[$key] ?? ''), true); }
        $featured = wugan_import_image($product['image'] ?? '', $id);
        if ($featured) { set_post_thumbnail($id, $featured); }
        $gallery = array();
        foreach ((array) ($product['gallery'] ?? array()) as $image) { $attachment = wugan_import_image($image, $id); if ($attachment) { $gallery[] = $attachment; } }
        add_post_meta($id, '_wugan_gallery', wp_json_encode($gallery), true);
    }
    foreach (glob(get_theme_file_path('/assets/*')) ?: array() as $asset) {
        if (is_file($asset) && wp_get_image_mime($asset)) { wugan_import_image(basename($asset)); }
    }
    flush_rewrite_rules(false);
    wp_safe_redirect(admin_url('themes.php?page=wugan-setup&complete=1'));
    exit;
});
