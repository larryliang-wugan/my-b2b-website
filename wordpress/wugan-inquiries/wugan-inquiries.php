<?php
/**
 * Plugin Name: WUGAN Inquiries
 * Description: Private inquiry records, email notifications and an integration hook.
 * Version: 1.1.1
 * Requires PHP: 8.1
 */
if (!defined('ABSPATH')) { exit; }
add_filter('admin_footer_text', function ($text) {
    $screen = get_current_screen();
    if ($screen && 'wugan_inquiry' === $screen->post_type) {
        return 'WUGAN Inquiries v1.1.1';
    }
    return $text;
});
add_action('init', function () {
    register_post_type('wugan_inquiry', [
        'label'=>'WUGAN Inquiries', 'public'=>false, 'publicly_queryable'=>false,
        'show_ui'=>true, 'show_in_rest'=>false, 'exclude_from_search'=>true,
        'rewrite'=>false, 'query_var'=>false, 'supports'=>['title','editor'],
        'map_meta_cap'=>false, 'capabilities'=>array_fill_keys([
            'edit_post','read_post','delete_post','edit_posts','edit_others_posts',
            'publish_posts','read_private_posts','delete_posts','delete_private_posts',
            'delete_published_posts','delete_others_posts','edit_private_posts','edit_published_posts',
        ], 'manage_options') + ['create_posts'=>'do_not_allow'],
    ]);
});
function wugan_products() {
    return ['underwear'=>'Performance underwear', 'socks'=>'Athletic socks', 'both'=>'Underwear and socks'];
}
function wugan_request_types() {
    return ['Custom quote', 'Samples', 'Factory introduction', 'Documentation'];
}
// Receipt cookies contain only random tokens; no customer data goes into URLs or cookies.
add_action('template_redirect', function () {
    if (is_page('contact') || isset($_GET['inquiry'])) {
        if (!defined('DONOTCACHEPAGE')) { define('DONOTCACHEPAGE', true); }
        nocache_headers();
        header('Referrer-Policy: no-referrer');
    }
});
add_shortcode('wugan_inquiry', function ($attributes = []) {
    $attributes = shortcode_atts(['type'=>''], $attributes, 'wugan_inquiry');
    $products = wugan_products();
    $product = isset($_GET['product']) && is_string($_GET['product']) ? sanitize_text_field(wp_unslash($_GET['product'])) : '';
    $aliases = ['performance-underwear'=>'underwear', 'athletic-socks'=>'socks', 'underwear-and-socks'=>'both'];
    $product = $aliases[$product] ?? $product;
    if (in_array($product, $products, true)) { $product = array_search($product, $products, true); }
    $reference = '';
    $style = $product ? get_page_by_path(sanitize_title($product), OBJECT, 'wugan_product') : null;
    if ($style) {
        $reference = 'Interested in ' . get_post_meta($style->ID, '_wugan_code', true) . ' - ' . $style->post_title . ".\n";
        $product = 'underwear';
    }
    $request = isset($_GET['request_type']) && is_string($_GET['request_type']) ? sanitize_text_field(wp_unslash($_GET['request_type'])) : $attributes['type'];
    if (is_page('samples')) { $request = 'Samples'; }
    if ('samples' === $request) { $request = 'Samples'; }
    ob_start();
    if (is_page('contact') && isset($_GET['inquiry']) && 'received' === $_GET['inquiry']) {
        $token = $_COOKIE['wugan_receipt'] ?? '';
        $receipt = is_string($token) && preg_match('/^[a-f0-9]{64}$/D', $token) ? get_transient('wugan_receipt_' . hash('sha256', $token)) : false;
        if (is_array($receipt)) {
            echo '<p class="wugan-notice" role="status"><strong>Thank you. Your inquiry has been saved.</strong> Reference #' . esc_html($receipt['id']) . '. ';
            echo 'accepted_by_mailer' === $receipt['status']
                ? 'Our team will review your project requirements.'
                : 'The email notification could not be sent. Please contact sales@wugan.net with your reference number; you do not need to submit again.';
            echo '</p>';
        } else {
            echo '<p class="wugan-notice" role="status">No recent submission can be verified in this browser. If you already submitted, contact sales@wugan.net before submitting again.</p>';
        }
    }
    ?>
    <style>
        .wugan-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;max-width:100%;text-align:left}
        .wugan-form label{display:block;min-width:0;font-size:14px;font-weight:600}
        .wugan-form input,.wugan-form select,.wugan-form textarea{box-sizing:border-box;display:block;width:100%;min-width:0;margin-top:8px;padding:12px;font:inherit;color:#172b26;background:#fff;border:1px solid #aab9b4;border-radius:4px}
        .wugan-form textarea{resize:vertical}.wugan-form .wide{grid-column:1/-1}
        .wugan-form .consent{display:flex;align-items:flex-start;gap:10px;font-weight:400}
        .wugan-form .consent input{flex:0 0 18px;width:18px;height:18px;margin:3px 0}
        .wugan-form .wugan-trap{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
        .wugan-form button{padding:14px 22px;border:0;border-radius:4px;background:#126b56;color:#fff;font:inherit;cursor:pointer;max-width:100%;white-space:normal}
        .wugan-form :focus-visible{outline:3px solid #267caf;outline-offset:3px}
        .wugan-form small{display:block;font-weight:400;margin-top:8px;overflow-wrap:anywhere}
        .wugan-notice{padding:16px;border-left:4px solid #126b56;background:#eef6f2;color:#172b26;overflow-wrap:anywhere}
        @media(max-width:600px){.wugan-form{grid-template-columns:minmax(0,1fr)}}
    </style>
    <form class="wugan-form" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post">
        <input type="hidden" name="action" value="wugan_submit">
        <?php wp_nonce_field('wugan_inquiry', 'wugan_nonce'); ?>
        <label>Name *<input name="customer_name" required maxlength="120" autocomplete="name"></label>
        <label>Work email *<input type="email" name="email" required maxlength="254" autocomplete="email"></label>
        <label>Company *<input name="company" required maxlength="180" autocomplete="organization"></label>
        <label>Country / region *<input name="country" required maxlength="100" autocomplete="country-name"></label>
        <label>Product *<select name="product" required><option value="">Select a product</option><?php foreach ($products as $key=>$label) : ?><option value="<?php echo esc_attr($key); ?>" <?php selected($product, $key); ?>><?php echo esc_html($label); ?></option><?php endforeach; ?></select></label>
        <label>Estimated quantity<input type="number" name="quantity" min="1" max="100000000" step="1"></label>
        <label>Request type *<select name="request_type" required><?php foreach (wugan_request_types() as $type) : ?><option <?php selected($request, $type); ?>><?php echo esc_html($type); ?></option><?php endforeach; ?></select></label>
        <label class="wide">Project details *<textarea name="message" rows="6" required maxlength="6000"><?php echo esc_textarea($reference); ?></textarea><small>Include fabric, branding, destination and your target date. Email your tech pack to <a href="mailto:sales@wugan.net">sales@wugan.net</a> with your inquiry reference.</small></label>
        <label class="wugan-trap" aria-hidden="true">Leave blank<input name="website_confirm" tabindex="-1" autocomplete="off"></label>
        <label class="wide consent"><input type="checkbox" name="consent" value="1" required><span>I agree to be contacted about this inquiry and have read the <a href="<?php echo esc_url(get_privacy_policy_url() ?: home_url('/privacy/')); ?>">privacy policy</a>.</span></label>
        <div class="wide"><button type="submit">Submit inquiry</button></div>
    </form>
    <?php return ob_get_clean();
});
add_action('admin_post_nopriv_wugan_submit','wugan_handle_inquiry');
add_action('admin_post_wugan_submit','wugan_handle_inquiry');
function wugan_handle_inquiry() {
    if ('POST' !== ($_SERVER['REQUEST_METHOD'] ?? '')) { wp_die('Method not allowed.', '', ['response'=>405]); }
    $nonce = $_POST['wugan_nonce'] ?? '';
    if (!is_string($nonce) || !wp_verify_nonce(wp_unslash($nonce), 'wugan_inquiry')) { wp_die('Your form expired. Reload the contact page and try again.', '', ['response'=>403]); }
    if ('' !== ($_POST['website_confirm'] ?? '')) { wp_die('Unable to submit.', '', ['response'=>400]); }
    if (!empty($_FILES)) { wp_die('Please email attachments to sales@wugan.net. Website uploads are not accepted.', '', ['response'=>400]); }
    $fields = ['customer_name'=>120,'email'=>254,'company'=>180,'country'=>100,'product'=>80,'quantity'=>9,'request_type'=>80,'message'=>6000];
    $data = [];
    foreach ($fields as $key=>$limit) {
        $value = $_POST[$key] ?? '';
        if (!is_string($value) || strlen($value) > $limit * 4) { wp_die('Invalid field.', '', ['response'=>400]); }
        $data[$key] = 'message' === $key ? sanitize_textarea_field(wp_unslash($value)) : sanitize_text_field(wp_unslash($value));
        $length = function_exists('mb_strlen') ? mb_strlen($data[$key], 'UTF-8') : strlen($data[$key]);
        if ($length > $limit) { wp_die('A field is too long.', '', ['response'=>400]); }
    }
    if (!$data['customer_name'] || !$data['company'] || !$data['country'] || !$data['message'] || !is_email($data['email']) || '1' !== ($_POST['consent'] ?? '')) { wp_die('Please complete the required fields.', '', ['response'=>400, 'back_link'=>true]); }
    $products = wugan_products();
    if (in_array($data['product'], $products, true)) { $data['product'] = array_search($data['product'], $products, true); }
    if (!isset($products[$data['product']]) || !in_array($data['request_type'], wugan_request_types(), true)
        || ('' !== $data['quantity'] && (!preg_match('/^[1-9][0-9]{0,8}$/D', $data['quantity']) || (int)$data['quantity'] > 100000000))) {
        wp_die('Please choose a valid product, request type and whole-number quantity (1 to 100000000).', '', ['response'=>400, 'back_link'=>true]);
    }
    $data['product'] = $products[$data['product']];
    $rate_key = 'wugan_rate_' . hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? '', wp_salt());
    $count = (int)get_transient($rate_key);
    if ($count >= 5) { wp_die('Please try later or email sales@wugan.net.', '', ['response'=>429]); }
    set_transient($rate_key,$count+1,10*MINUTE_IN_SECONDS);
    $body = '';
    foreach ($data as $key=>$value) { $body .= $key . ': ' . $value . "\n\n"; }
    $id = wp_insert_post(wp_slash(['post_type'=>'wugan_inquiry','post_status'=>'private','post_title'=>$data['customer_name'].' - '.$data['request_type'],'post_content'=>$body]),true);
    if (is_wp_error($id) || !$id) { wp_die('Could not save your inquiry. Please email sales@wugan.net.', '', ['response'=>500]); }
    update_post_meta($id,'_wugan_consent_at',gmdate('c'));
    update_post_meta($id,'_wugan_data',wp_slash($data));
    update_post_meta($id,'_wugan_consent', 'Agreed to contact about this inquiry and the privacy policy.');
    update_post_meta($id,'_wugan_email_status','pending');
    try {
        $sent = wp_mail('sales@wugan.net','WUGAN inquiry #'.$id,$body,['Content-Type: text/plain; charset=UTF-8', 'Reply-To: '.$data['email']]);
    } catch (Throwable $error) {
        $sent = false;
    }
    update_post_meta($id,'_wugan_email_status',$sent ? 'accepted_by_mailer' : 'failed');
    // Integration point only. No CRM adapter is included or connected.
    try {
        do_action('wugan_inquiry_created',$id,$data);
    } catch (Throwable $error) {
        update_post_meta($id,'_wugan_integration_status','hook_failed');
    }
    $token = bin2hex(random_bytes(32));
    set_transient('wugan_receipt_' . hash('sha256', $token), ['id'=>$id, 'status'=>$sent ? 'accepted_by_mailer' : 'failed'], 30 * MINUTE_IN_SECONDS);
    setcookie('wugan_receipt', $token, ['expires'=>time() + 30 * MINUTE_IN_SECONDS, 'path'=>wp_parse_url(home_url('/'), PHP_URL_PATH) ?: '/', 'secure'=>is_ssl(), 'httponly'=>true, 'samesite'=>'Lax']);
    nocache_headers();
    wp_safe_redirect(add_query_arg('inquiry','received',home_url('/contact/')),303);
    exit;
}
add_filter('manage_wugan_inquiry_posts_columns',function($columns){$columns['wugan_mail']='Email status';return $columns;});
function wugan_mail_status_label($status) {
    $labels = ['accepted_by_mailer'=>'Accepted by mailer (delivery unconfirmed)', 'failed'=>'Failed - contact customer manually', 'pending'=>'Pending / interrupted - check mail logs'];
    return $labels[$status] ?? 'Unknown - check mail logs';
}
add_action('manage_wugan_inquiry_posts_custom_column',function($column,$id){if('wugan_mail'===$column){echo esc_html(wugan_mail_status_label(get_post_meta($id,'_wugan_email_status',true)));}},10,2);
add_action('add_meta_boxes_wugan_inquiry', function () {
    add_meta_box('wugan_delivery', 'Notification and consent', function ($post) {
        echo '<p>' . esc_html(wugan_mail_status_label(get_post_meta($post->ID, '_wugan_email_status', true))) . '</p>';
        echo '<p>Consent (UTC): ' . esc_html(get_post_meta($post->ID, '_wugan_consent_at', true)) . '</p>';
        echo '<p>CRM: no connector is included. An integration hook is available.</p>';
    }, 'wugan_inquiry', 'side');
});
add_action('restrict_manage_posts', function ($post_type) {
    if ('wugan_inquiry' !== $post_type || !current_user_can('manage_options')) { return; }
    $url = wp_nonce_url(admin_url('admin-post.php?action=wugan_export'), 'wugan_export');
    echo '<a class="button" href="' . esc_url($url) . '">Export all inquiries (CSV)</a> ';
});
function wugan_csv_cell($value) {
    $value = (string)$value;
    // Prevent spreadsheet formula execution, including formulas behind whitespace.
    return preg_match('/^[\s\x{FEFF}]*[=+@-]|^[\t\r\n]/u', $value) ? "'" . $value : $value;
}
add_action('admin_post_wugan_export', function () {
    if (!current_user_can('manage_options')) { wp_die('Access denied.', '', ['response'=>403]); }
    check_admin_referer('wugan_export');
    nocache_headers();
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="wugan-inquiries-' . gmdate('Y-m-d') . '.csv"');
    header('X-Content-Type-Options: nosniff');
    $stream = fopen('php://output', 'w');
    if (!$stream) { wp_die('Could not open export.', '', ['response'=>500]); }
    fwrite($stream, "\xEF\xBB\xBF");
    $fields = ['customer_name','email','company','country','product','quantity','request_type','message'];
    fputcsv($stream, array_merge(['ID','Created (UTC)'], $fields, ['Consent (UTC)','Email status','Legacy record']), ',', '"', '');
    $page = 1;
    do {
        $records = get_posts(['post_type'=>'wugan_inquiry','post_status'=>['private','publish','draft','pending'], 'posts_per_page'=>200, 'paged'=>$page++, 'orderby'=>'ID','order'=>'ASC']);
        foreach ($records as $record) {
            $data = get_post_meta($record->ID, '_wugan_data', true);
            $row = [$record->ID, $record->post_date_gmt];
            foreach ($fields as $field) { $row[] = is_array($data) ? ($data[$field] ?? '') : ''; }
            $row[] = get_post_meta($record->ID, '_wugan_consent_at', true);
            $row[] = wugan_mail_status_label(get_post_meta($record->ID, '_wugan_email_status', true));
            $row[] = is_array($data) ? '' : $record->post_content;
            fputcsv($stream, array_map('wugan_csv_cell', $row), ',', '"', '');
        }
    } while (count($records) === 200);
    fclose($stream);
    exit;
});
