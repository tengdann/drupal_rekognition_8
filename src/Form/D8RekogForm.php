<?php

namespace Drupal\d8rekog\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure the admin settings for this module
 */
class D8RekogForm extends ConfigFormBase {
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
        return 'd8rekog_form';
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
        $form = parent::buildForm($form, $form_state);

        $config = $this->config(static::SETTINGS);

        $form['aws_region'] = array(
            '#type' => 'textfield',
            '#title' => $this->t('AWS Console Region'),
            '#description' => $this->t('Access your AWS console to set up Identity Pool Region.'),
            '#required' => TRUE,
            '#default_value' => $config->get('d8rekog.aws_region')
        );

        $form['ident_pool_id'] = array(
            '#type' => 'textfield',
            '#title' => $this->t('Identity Pool ID'),
            '#description' => $this->t('Access your AWS console to set up Identity Pool ID.'),
            '#required' => TRUE,
            '#default_value' => $config->get('d8rekog.ident_pool_id')
        );

        return $form;
    }

    /**
     * {@inheritdoc}
     */
//    public function validateForm(array &$form, FormStateInterface $form_state) {
//
//    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {
        // Retrieve the configuration
        $config = $this->config(static::SETTINGS);
            // Set the submitted configuration settings
        $config->set('d8rekog.aws_region', $form_state->getValue('aws_region'));
        $config->set('d8rekog.ident_pool_id', $form_state->getValue('ident_pool_id'));
        $config->save();

        return parent::submitForm($form, $form_state);
    }
}