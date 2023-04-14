## Adding a translation
To add a new translation, create a new json file in the `i18n` directory with the [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) formatted name of said language (e.g. `en` for English, `de` for German or `af` for Afrikaans :^) ) 

Use the following template when creating your file

```json
{
    "invalid_email": "",
    "email_not_found": "",
    "imap_error": "",
    "err_already_verified": "",
    "verification_successful": "",

    "message_pinned": "",
    "message_unpinned": "",
    "message_deleted": "",
    "user_promoted": "",
    "user_demoted": "",

    "leaderboard": "Leaderboard",
    "xp_msg": "",
    "xp_msg_none": ""
}
```