<?php defined('ABSPATH') || exit; ?>
<!doctype html><html <?php language_attributes(); ?>><head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><?php wp_head(); ?></head>
<body <?php body_class('second-scheme'); ?>><?php wp_body_open(); ?>
<a class="skip-link screen-reader-text" href="#main-content">Skip to content</a>
<div class="utility-bar"><div class="container utility-inner"><span>OEM / ODM MANUFACTURING &nbsp; / &nbsp; ZHONGSHAN, CHINA</span><div class="utility-links"><a href="mailto:sales@wugan.net">sales@wugan.net</a><?php wugan_language_navigation(); ?></div></div></div>
<header class="site-header"><div class="container header-inner"><a class="brand" href="<?php echo esc_url(home_url('/')); ?>" aria-label="WUGAN home"><img src="<?php echo esc_url(get_theme_file_uri('/assets/logo.png')); ?>" alt="WUGAN" width="64" height="64"><span class="brand-copy">PERFORMANCE UNDERWEAR<br>&amp; SOCKS MANUFACTURER</span></a>
<details class="mobile-navigation"><summary class="nav-toggle" aria-label="Toggle navigation">Menu</summary><?php wugan_second_nav('mobile-nav'); ?></details><?php wugan_second_nav('desktop-nav'); ?></div></header>
<main id="main-content">
<?php function wugan_second_nav($class) { ?>
<nav class="site-nav <?php echo esc_attr($class); ?>" aria-label="<?php echo 'desktop-nav' === $class ? 'Main navigation' : 'Mobile navigation'; ?>"><ul class="nav-list"><li><a href="<?php echo esc_url(home_url('/')); ?>"<?php if (is_front_page()) { echo ' aria-current="page"'; } ?>>Home</a></li>
<?php foreach (array(
    'Products' => array('products/' => 'All product programs', 'underwear/' => 'Performance underwear', 'underwear/?category=active' => 'Active & long-leg', 'underwear/?category=natural' => 'Natural-fiber directions', 'underwear/?category=seamless' => 'Clean-finish underwear', 'socks/' => 'Athletic socks'),
    'Development' => array('oem-odm/' => 'OEM & ODM services', 'customization/' => 'Custom options', 'fabrics/' => 'Fabrics & construction', 'samples/' => 'Sample development', 'brand-development/' => 'Development for brands'),
    'Our Company' => array('about/' => 'About WUGAN', 'factories/' => 'Our factories', 'quality-assurance/' => 'Quality & documentation', 'partnerships/' => 'Customer visits'),
) as $label => $items) { ?>
<li class="nav-group"><details class="product-menu"><summary><?php echo esc_html($label); ?></summary><ul class="nav-dropdown dropdown-menu"><?php foreach ($items as $slug => $name) { ?><li><a href="<?php echo esc_url(home_url('/' . $slug)); ?>"><?php echo esc_html($name); ?></a></li><?php } ?></ul></details></li>
<?php } ?>
<li><a href="<?php echo esc_url(home_url('/resources/')); ?>">Resources</a></li><li><a class="header-cta button button-primary" href="<?php echo esc_url(home_url('/contact/')); ?>">Discuss your project <i data-lucide="arrow-up-right" aria-hidden="true"></i></a></li></ul></nav>
<?php } ?>
