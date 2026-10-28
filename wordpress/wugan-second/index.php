<?php defined('ABSPATH') || exit; get_header(); ?>
<section class="section"><div class="container">
<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
<article <?php post_class(); ?>><h1><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h1><?php the_content(); wp_link_pages(); ?></article>
<?php endwhile; the_posts_pagination(); else : ?><h1>Page not found</h1><p><a href="<?php echo esc_url(home_url('/products/')); ?>">Explore our products</a></p><?php endif; ?>
</div></section><?php get_footer(); ?>
