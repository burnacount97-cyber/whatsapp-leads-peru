<?php
/**
 * Widget Injector
 * Handles the injection of LeadWidget script into the website footer
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class LeadWidget_Injector
{

    /**
     * Inject widget script into footer
     */
    public static function inject_widget()
    {
        // Check if widget is enabled
        $enabled = get_option('leadwidget_enabled', '1');
        if ($enabled !== '1') {
            return;
        }

        // Get User ID
        $user_id = get_option('leadwidget_user_id', '');

        // Don't inject if no User ID is set
        if (empty($user_id)) {
            return;
        }

        // Don't inject in admin pages
        if (is_admin()) {
            return;
        }

        // Sanitize User ID (extra safety)
        $user_id = sanitize_text_field($user_id);

        // Build script URL
        $script_url = self::get_script_url($user_id);

        // Output the script tag
        echo self::render_script_tag($script_url);
    }

    /**
     * Get the widget script URL
     * 
     * @param string $user_id User ID from settings
     * @return string Full URL to widget script
     */
    private static function get_script_url($user_id)
    {
        // Production URL (change this to your actual domain)
        $base_url = 'https://whatsapp-leads-peru.vercel.app';

        // Allow filtering for custom domains or staging environments
        $base_url = apply_filters('leadwidget_script_base_url', $base_url);

        return trailingslashit($base_url) . 'api/w/' . urlencode($user_id);
    }

    /**
     * Render the script tag HTML
     * 
     * @param string $script_url URL to widget script
     * @return string HTML script tag
     */
    private static function render_script_tag($script_url)
    {
        $output = "\n<!-- LeadWidget by LeadWidget.com -->\n";
        $output .= sprintf(
            '<script src="%s" async id="leadwidget-script"></script>',
            esc_url($script_url)
        );
        $output .= "\n<!-- /LeadWidget -->\n";

        return $output;
    }

    /**
     * Check if current page should load widget
     * 
     * @return boolean True if widget should load
     */
    public static function should_load_widget()
    {
        // Allow for conditional loading via filter
        $should_load = true;

        // Don't load on login/register pages
        if (is_page(array('login', 'register', 'checkout'))) {
            $should_load = false;
        }

        // Allow theme/plugin developers to customize
        return apply_filters('leadwidget_should_load', $should_load);
    }
}
