<?php defined('ABSPATH') || exit; ?>
</main>
<footer class="site-footer"><div class="container footer-grid">
<div class="footer-brand"><a href="<?php echo esc_url(home_url('/')); ?>"><img src="<?php echo esc_url(get_theme_file_uri('/assets/logo.png')); ?>" alt="WUGAN" width="156" height="52"></a><p>Performance underwear &amp; socks.<br>Made for your brand.</p></div>
<div><h2>Products</h2><ul><?php foreach (array('underwear' => 'Underwear', 'socks' => 'Socks', 'products' => 'All products', 'customization' => 'Customization') as $slug => $label) { ?><li><a href="<?php echo esc_url(home_url('/' . $slug . '/')); ?>"><?php echo esc_html($label); ?></a></li><?php } ?></ul></div>
<div><h2>WUGAN</h2><ul><?php foreach (array('about' => 'About us', 'fabrics' => 'Fabrics', 'factories' => 'Our factories', 'quality-assurance' => 'Quality & documentation', 'partnerships' => 'Customer visits', 'brand-development' => 'Development for brands', 'resources' => 'Resources', 'contact' => 'Contact') as $slug => $label) { ?><li><a href="<?php echo esc_url(home_url('/' . $slug . '/')); ?>"><?php echo esc_html($label); ?></a></li><?php } ?></ul></div>
<div><h2>Start your project</h2><a class="button button-primary" href="<?php echo esc_url(home_url('/contact/')); ?>">Get a quote</a><ul><?php foreach (array('samples' => 'Request samples', 'faq' => 'FAQ', 'privacy' => 'Privacy policy') as $slug => $label) { ?><li><a href="<?php echo esc_url(home_url('/' . $slug . '/')); ?>"><?php echo esc_html($label); ?></a></li><?php } ?></ul></div>
</div><div class="container footer-bottom"><p>&copy; <?php echo esc_html(wp_date('Y')); ?> Wugan. All rights reserved. <span class="site-version">Second Scheme v<?php echo esc_html(wp_get_theme()->get('Version')); ?></span></p></div></footer>
<a class="floating-contact" href="https://wa.me/8613692352052" aria-label="Contact WUGAN on WhatsApp">WhatsApp ↗</a>
<?php wp_footer(); ?></body></html>
