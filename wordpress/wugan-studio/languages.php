<?php
defined('ABSPATH') || exit;

function wugan_language_navigation() {
    $languages = function_exists('pll_the_languages') ? pll_the_languages(array('raw' => 1, 'hide_if_no_translation' => 1)) : array();
    $current = 'English';
    foreach ((array) $languages as $language) {
        if (!empty($language['current_lang'])) { $current = $language['name']; }
    }
    ?><details class="language-menu"><summary aria-label="Choose language"><i data-lucide="globe" aria-hidden="true"></i><span><?php echo esc_html($current); ?></span><i data-lucide="chevron-down" aria-hidden="true"></i></summary><ul><?php
    if (count((array) $languages) > 1) {
        foreach ($languages as $language) {
            ?><li><a href="<?php echo esc_url($language['url']); ?>" lang="<?php echo esc_attr($language['slug']); ?>"<?php if (!empty($language['current_lang'])) { echo ' aria-current="true"'; } ?>><?php echo esc_html($language['name']); ?></a></li><?php
        }
    } else {
        // No translated pages are installed. Translation is external and opt-in.
        $page = is_singular() ? get_permalink() : home_url('/');
        $relative = str_replace(untrailingslashit(home_url('/')), '', $page);
        $target = 'https://wugan.net/' . ltrim(wp_parse_url($relative, PHP_URL_PATH) ?: '/', '/');
        ?><li><a href="<?php echo esc_url($page); ?>" lang="en" aria-current="true">English</a></li><?php
        foreach (array('es' => 'Espa&#241;ol', 'de' => 'Deutsch', 'fr' => 'Fran&#231;ais') as $code => $label) {
            $url = add_query_arg(array('sl' => 'en', 'tl' => $code, 'u' => $target), 'https://translate.google.com/translate');
            ?><li><a href="<?php echo esc_url($url); ?>" target="_blank" rel="noopener noreferrer" lang="<?php echo esc_attr($code); ?>" aria-label="<?php echo esc_attr(html_entity_decode($label) . ' - Google Translate, opens a new tab'); ?>"><?php echo wp_kses_post($label); ?><small>Google Translate <span aria-hidden="true">↗</span></small></a></li><?php
        }
    }
    ?></ul></details><?php
}
