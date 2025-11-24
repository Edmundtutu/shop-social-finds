<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'flutterwave' => [
        'seed_subaccounts' => env('FLW_SEED_SUBACCOUNTS', false),
        'seed_bank_code' => env('FLW_SEED_BANK_CODE', '035'),
        'seed_bank_name' => env('FLW_SEED_BANK_NAME', 'Stanbic Bank Uganda'),
        'seed_country' => env('FLW_SEED_COUNTRY', 'UG'),
        'seed_split_percentage' => env('FLW_SEED_SPLIT_PERCENTAGE', 50),
    ],

];
