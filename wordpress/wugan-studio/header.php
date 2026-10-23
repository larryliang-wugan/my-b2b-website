<?php defined('ABSPATH') || exit; ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link screen-reader-text" href="#main-content">Skip to content</a>
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
    <ul class="nav-list"><li class="nav-group"><details class="product-menu"><summary>Products</summary><ul class="nav-dropdown dropdown-menu">
        <?php foreach (array('underwear/' => 'All underwear', 'underwear/?category=active' => 'Active & long-leg', 'underwear/?category=seamless' => 'Clean-finish underwear', 'underwear/?category=natural' => 'Natural fiber options', 'underwear/?category=everyday' => 'Everyday comfort', 'socks/' => 'Athletic socks', 'products/' => 'All product programs') as $slug => $label) { ?><li><a href="<?php echo esc_url(home_url('/' . $slug)); ?>"><?php echo esc_html($label); ?></a></li><?php } ?>
    </ul></details></li>
    <?php foreach (array('customization' => 'Customization', 'fabrics' => 'Fabrics', 'factories' => 'Factories', 'about' => 'About', 'resources' => 'Resources', 'contact' => 'Contact') as $slug => $label) { ?><li><a href="<?php echo esc_url(home_url('/' . $slug . '/')); ?>"><?php echo esc_html($label); ?></a></li><?php } ?>
    <li><a class="header-cta button button-primary" href="<?php echo esc_url(home_url('/contact/')); ?>">Get a quote</a></li>
    </ul></nav>
    <?php
}
