<?php
/**
 * Plugin Name: WUGAN Inquiries
 * Description: Private inquiry records, email notifications and an integration hook.
 * Version: 1.0.0
 * Requires PHP: 8.1
 */
if (!defined('ABSPATH')) { exit; }
add_action('init', function () {
    register_post_type('wugan_inquiry', ['label'=>'WUGAN Inquiries','public'=>false,'show_ui'=>true,'supports'=>['title','editor'],'capability_type'=>'post','capabilities'=>['create_posts'=>'do_not_allow'],'map_meta_cap'=>true]);
});
add_shortcode('wugan_inquiry', function () {
    ob_start();
    if (isset($_GET['inquiry']) && 'received' === $_GET['inquiry']) {
        echo '<p class="wugan-notice" role="status">Thank you. Your inquiry has been saved. Our team will review your requirements.</p>';
    }
    ?>
    <form class="wugan-form" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post">
        <input type="hidden" name="action" value="wugan_submit">
        <?php wp_nonce_field('wugan_inquiry', 'wugan_nonce'); ?>
        <label>Name *<input name="customer_name" required maxlength="120" autocomplete="name"></label>
        <label>Work email *<input type="email" name="email" required maxlength="254" autocomplete="email"></label>
        <label>Company<input name="company" maxlength="180" autocomplete="organization"></label>
        <label>Product<select name="product"><option>Performance underwear</option><option>Athletic socks</option><option>Underwear and socks</option></select></label>
        <label>Estimated quantity<input type="number" name="quantity" min="1" max="100000000" step="1"></label>
        <label>Request type<select name="request_type"><option>Custom quote</option><option>Samples</option><option>Factory introduction</option><option>Documentation</option></select></label>
        <label class="wide">Project details *<textarea name="message" rows="5" required maxlength="6000"></textarea><small>Include fabric, branding, destination and your target date. Email tech packs to sales@wugan.net.</small></label>
        <label class="wugan-trap" aria-hidden="true">Leave blank<input name="website_confirm" tabindex="-1" autocomplete="off"></label>
        <label class="wide consent"><input type="checkbox" name="consent" value="1" required><span>I agree to be contacted about this inquiry and have read the <a href="<?php echo esc_url(get_privacy_policy_url() ?: home_url('/privacy-policy/')); ?>">privacy policy</a>.</span></label>
        <div class="wide"><button type="submit">Send project inquiry &rarr;</button></div>
    </form>
    <?php return ob_get_clean();
});
add_action('admin_post_nopriv_wugan_submit','wugan_handle_inquiry');
add_action('admin_post_wugan_submit','wugan_handle_inquiry');
function wugan_handle_inquiry() {
    if ('POST' !== ($_SERVER['REQUEST_METHOD'] ?? '')) { wp_die('Method not allowed.', '', ['response'=>405]); }
    check_admin_referer('wugan_inquiry','wugan_nonce');
    if (!empty($_POST['website_confirm'])) { wp_die('Unable to submit.', '', ['response'=>400]); }
    $fields = ['customer_name'=>120,'email'=>254,'company'=>180,'product'=>80,'quantity'=>12,'request_type'=>80,'message'=>6000];
    $data = [];
    foreach ($fields as $key=>$limit) {
        $value = $_POST[$key] ?? '';
        if (!is_string($value) || strlen($value) > $limit * 4) { wp_die('Invalid field.', '', ['response'=>400]); }
        $data[$key] = 'message' === $key ? sanitize_textarea_field(wp_unslash($value)) : sanitize_text_field(wp_unslash($value));
    }
    if (!$data['customer_name'] || !$data['message'] || !is_email($data['email']) || '1' !== ($_POST['consent'] ?? '')) { wp_die('Please complete the required fields.', '', ['response'=>400]); }
    $rate_key = 'wugan_rate_' . hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? '', wp_salt());
    $count = (int)get_transient($rate_key);
    if ($count >= 5) { wp_die('Please try later or email sales@wugan.net.', '', ['response'=>429]); }
    set_transient($rate_key,$count+1,10*MINUTE_IN_SECONDS);
    $body = '';
    foreach ($data as $key=>$value) { $body .= $key . ': ' . $value . "\n\n"; }
    $id = wp_insert_post(['post_type'=>'wugan_inquiry','post_status'=>'private','post_title'=>$data['customer_name'].' - '.$data['request_type'],'post_content'=>$body],true);
    if (is_wp_error($id) || !$id) { wp_die('Could not save your inquiry. Please email sales@wugan.net.', '', ['response'=>500]); }
    update_post_meta($id,'_wugan_consent_at',gmdate('c'));
    $sent = wp_mail('sales@wugan.net','WUGAN inquiry #'.$id,$body,['Reply-To: '.$data['email']]);
    update_post_meta($id,'_wugan_email_status',$sent ? 'accepted_by_mailer' : 'failed');
    // An authenticated OKKI adapter can consume saved inquiries independently of email.
    do_action('wugan_inquiry_created',$id,$data);
    wp_safe_redirect(add_query_arg('inquiry','received',home_url('/')).'#inquiry',303);
    exit;
}
add_filter('manage_wugan_inquiry_posts_columns',function($columns){$columns['wugan_mail']='Email status';return $columns;});
add_action('manage_wugan_inquiry_posts_custom_column',function($column,$id){if('wugan_mail'===$column){echo esc_html(get_post_meta($id,'_wugan_email_status',true));}},10,2);
