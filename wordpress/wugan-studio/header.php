<?php defined('ABSPATH') || exit; ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link screen-reader-text" href="#main-content">Skip to content</a>
<div class="utility-bar"><div class="container utility-inner"><span>Private-label development / Underwear &amp; socks</span><div class="utility-links"><a href="mailto:sales@wugan.net">sales@wugan.net</a><a href="https://wa.me/8613692352052">WhatsApp</a><?php if (function_exists('pll_the_languages') && count(pll_languages_list()) > 1) { ?><ul class="utility-languages"><?php pll_the_languages(array('show_flags' => 0, 'show_names' => 1, 'hide_if_no_translation' => 1)); ?></ul><?php } ?></div></div></div>
<header class="site-header"><div class="container header-inner">
<a class="brand" href="<?php echo esc_url(home_url('/')); ?>" aria-label="Wugan home"><img src="<?php echo esc_url(get_theme_file_uri('/assets/logo.png')); ?>" alt="WUGAN" width="156" height="52"><span class="brand-copy">Performance underwear &amp; socks</span></a>
<details class="mobile-navigation"><summary class="nav-toggle" aria-label="Toggle navigation">Menu</summary><?php wugan_header_navigation('mobile-nav'); ?></details>
<?php wugan_header_navigation('desktop-nav'); ?>
</div></header>
<main id="main-content">
<?php
function wugan_header_navigation($class) {
    ?>
    <nav class="site-nav <?php echo esc_attr($class); ?>" aria-label="<?php echo 'mobile-nav' === $class ? 'Mobile navigation' : 'Main navigation'; ?>">
    <ul class="nav-list"><li class="nav-group"><details class="product-menu"><summary>Products</summary><ul class="nav-dropdown mega-menu">
        <li><h2>Underwear collection</h2><ul><?php foreach (array('underwear/' => 'All underwear', 'underwear/?category=active' => 'Active & long-leg', 'underwear/?category=seamless' => 'Clean-finish underwear', 'underwear/?category=natural' => 'Natural fiber options', 'underwear/?category=everyday' => 'Everyday comfort') as $slug => $label) { ?><li><a href="<?php echo esc_url(home_url('/' . $slug)); ?>"><?php echo esc_html($label); ?></a></li><?php } ?></ul></li>
        <li><h2>Build your collection</h2><ul><?php foreach (array('socks' => 'Athletic socks', 'brand-development' => 'Development for brands', 'fabrics' => 'Fabric & construction', 'samples' => 'Request samples', 'products' => 'All product programs') as $slug => $label) { ?><li><a href="<?php echo esc_url(home_url('/' . $slug . '/')); ?>"><?php echo esc_html($label); ?></a></li><?php } ?></ul></li>
        <li class="menu-feature"><a href="<?php echo esc_url(home_url('/customization/')); ?>"><img src="<?php echo esc_url(get_theme_file_uri('/assets/waistband-detail.jpg')); ?>" alt="Custom jacquard waistband detail">Your fit. Your materials. Your label. ↗</a></li>
    </ul></details></li>
    <?php foreach (array('customization' => 'OEM / ODM', 'quality-assurance' => 'Quality', 'factories' => 'Factories', 'about' => 'About', 'resources' => 'Resources') as $slug => $label) { ?><li><a href="<?php echo esc_url(home_url('/' . $slug . '/')); ?>"><?php echo esc_html($label); ?></a></li><?php } ?>
    <li><a class="header-cta button button-primary" href="<?php echo esc_url(home_url('/contact/')); ?>">Get a quote</a></li>
    </ul></nav>
    <?php
}
