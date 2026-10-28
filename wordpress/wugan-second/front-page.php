<?php
defined('ABSPATH') || exit;
get_header();
if ('page' === get_option('show_on_front')) {
    while (have_posts()) { the_post(); the_content(); wp_link_pages(); }
} else {
    $home = get_page_by_path('home');
    if ($home && 'publish' === $home->post_status) { echo apply_filters('the_content', $home->post_content); }
}
get_footer();
