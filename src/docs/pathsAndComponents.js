import authPath from './internal/routes/AuthController/path.js'
import authComponent from './internal/routes/AuthController/component.js'
import mePath from './internal/routes/UserController/me/path.js'
import meComponent from './internal/routes/UserController/me/component.js'
import securitySchemes from './internal/security/securitySchemes.js';
import newPasswordPath from './internal/routes/UserController/newPassword/path.js';
import newPasswordComponent from './internal/routes/UserController/newPassword/component.js';
import whitelabelComponent from './internal/routes/WhitelabelController/component.js';
import whitelabelPath from './internal/routes/WhitelabelController/path.js';
import passwordControllerComponent from './internal/routes/PasswordController/component.js';
import passwordControllerPath from './internal/routes/PasswordController/path.js';

const pathsAndComponents = {
  paths: {
    ...passwordControllerPath,
    ...authPath,
    ...mePath,
    ...newPasswordPath,
    ...whitelabelPath
  },
  components: {
    schemas: {
      ...passwordControllerComponent,
      ...authComponent,
      ...meComponent,
      ...newPasswordComponent,
      ...whitelabelComponent
    },
    ...securitySchemes
  }
}
export default pathsAndComponents;
