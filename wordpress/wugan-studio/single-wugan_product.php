<?php defined('ABSPATH') || exit; get_header(); while (have_posts()) : the_post(); ?>
<section class="section product-detail"><div class="container">
<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="<?php echo esc_url(home_url('/products/')); ?>">Products</a> / <span><?php the_title(); ?></span></nav>
<div class="product-detail-grid"><div class="product-gallery">
<div class="product-main-image"><?php the_post_thumbnail('full'); ?></div>
<div class="product-thumbnails">
<?php $gallery = json_decode(get_post_meta(get_the_ID(), '_wugan_gallery', true), true);
foreach (is_array($gallery) ? $gallery : array() as $image) {
    $url = is_numeric($image) ? wp_get_attachment_image_url(absint($image), 'full') : $image;
    if (!$url) { continue; }
    ?><a href="<?php echo esc_url($url); ?>" class="gallery-link" aria-label="<?php echo esc_attr('View ' . get_the_title() . ' image'); ?>"><?php
    if (is_numeric($image)) { echo wp_get_attachment_image(absint($image), 'large', false, array('loading' => 'lazy')); }
    else { ?><img src="<?php echo esc_url($url); ?>" alt="<?php the_title_attribute(); ?>" loading="lazy"><?php }
    ?></a><?php
} ?></div></div>
<div class="product-info"><p class="eyebrow"><?php echo esc_html(get_post_meta(get_the_ID(), '_wugan_code', true)); ?></p><h1><?php the_title(); ?></h1>
<div class="product-description"><?php the_content(); ?></div>
<dl class="product-policies"><dt>Minimum order</dt><dd>From 300 pcs</dd><dt>Samples</dt><dd>From USD 15</dd><dt>Sampling</dt><dd>From 7 days</dd><dt>Production</dt><dd>From 15 days</dd></dl>
<p>Final terms confirmed in your quotation.</p>
<a class="button button-primary" href="<?php echo esc_url(add_query_arg('product', get_post_field('post_name', get_the_ID()), home_url('/contact/'))); ?>">Request a quote</a>
<a class="button" href="<?php echo esc_url(add_query_arg('product', get_post_field('post_name', get_the_ID()), home_url('/samples/'))); ?>">Request samples</a>
<div class="product-categories"><?php echo get_the_term_list(get_the_ID(), 'wugan_category', '', ', '); ?></div>
</div></div></div></section>
<?php
$related_terms = wp_get_post_terms(get_the_ID(), 'wugan_category', array('fields' => 'ids'));
if (!is_wp_error($related_terms) && $related_terms) {
    $related = wugan_product_grid(array('post__not_in' => array(get_the_ID()), 'tax_query' => array(array('taxonomy' => 'wugan_category', 'field' => 'term_id', 'terms' => $related_terms))));
    if ($related) { ?><section class="section related-products"><div class="container"><h2>Related products</h2><?php echo $related; ?></div></section><?php }
}
?>
<?php endwhile; get_footer(); ?>
