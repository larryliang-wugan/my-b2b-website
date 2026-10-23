<?php
defined('ABSPATH') || exit;
get_header();
$catalogue_page = is_post_type_archive('wugan_product') && !is_search() && empty($_GET['category']) ? get_page_by_path('products') : null;
if ($catalogue_page && 'publish' === $catalogue_page->post_status) {
    echo apply_filters('the_content', $catalogue_page->post_content);
    get_footer();
    return;
}
?>
<section class="page-heading section"><div class="container"><p class="eyebrow">Wugan collection</p><h1><?php echo is_search() ? 'Search products' : (is_tax('wugan_category') ? esc_html(single_term_title('', false)) : 'Products'); ?></h1></div></section>
<?php global $wp_query; wugan_catalogue($wp_query, is_tax('wugan_category') ? get_queried_object()->slug : ''); get_footer(); ?>
