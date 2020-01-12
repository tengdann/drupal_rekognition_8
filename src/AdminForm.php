<?php

namespace Drupal\d8rekog;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure the admin settings for this module
 */
class D8RekogAdminForm extends ConfigFormBase {
    /**
     * Config settings
     *
     * @var string
     */
    const SETTINGS = 'd8rekog.settings';

    /**
     * {@inheritdoc}
     */
    public function getFormId() {
        return 'd8rekog_admin_settings';
    }

    /**
     * {@inheritdoc}
     */
    protected function getEditableConfigNames() {
        return [
            static::SETTINGS,
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function  buildForm(array $form, FormStateInterface $form_state) {
        $config = $this->config(static::SETTINGS);

        $form['aws_region'] = array(
            '#type' => 'textfield',
            '#title' => $this->t('AWS Console Region'),
            '#description' => $this->t('Access your AWS console to set up Identity Pool Region.'),
            '#required' => TRUE,
            '#default_value' => $config->get('aws_region')
        );

        $form['ident_pool_id'] = array(
            '#type' => 'textfield',
            '#title' => $this->t('Identity Pool ID'),
            '#description' => $this->t('Access your AWS console to set up Identity Pool ID.'),
            '#required' => TRUE,
            '#default_value' => $config->get('ident_pool_id')
        );

        return parent::buildForm($form, $form_state);
    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {
        // Retrieve the configuration
        $this->configFactory->getEditable(static::SETTINGS)
            // Set the submitted configuration settings
            ->set('aws_region', $form_state->getValue('aws_region'))
            ->set('ident_pool_id', $form_state->getValue('ident_pool_id'))
            ->save();

        parent::submitForm($form, $form_state);
    }
}