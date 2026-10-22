<?php
if (!defined('ABSPATH')) { exit; }
add_action('wp_enqueue_scripts', function () { wp_enqueue_style('wugan', get_stylesheet_uri(), [], '1.0.0'); });
add_action('after_setup_theme', function () { add_theme_support('editor-styles'); add_editor_style('style.css'); });
add_action('init', function () { register_block_pattern_category('wugan', ['label' => 'WUGAN']); });
