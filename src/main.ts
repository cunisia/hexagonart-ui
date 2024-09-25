import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';

if (true) {
  // TODO replace condition by `process.env.NODE_ENV !== "production"` or equivalent
  loadDevMessages();
  loadErrorMessages();
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
