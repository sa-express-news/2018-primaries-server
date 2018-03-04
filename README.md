

### Authenticating for Google Sheets Access ###

This project includes code to help you authenticate with Google via the command line, but you must first [use the Google Developers Console](https://console.developers.google.com) to generate a secret key JSON file for your machine.

Follow the instructions [in step 1 of this guide](https://developers.google.com/sheets/api/quickstart/nodejs) to do so, saving the file that results as `client_secret.json` in the root directory of this project.

After that, the first time you run the project your terminal should walk you through getting access to the Google Sheets data. The whole process should take no more than a few minutes. Future runs of the program on the same machine will use stored credentials and not require these steps.