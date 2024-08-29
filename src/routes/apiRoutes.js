import express, { Router } from 'express';
import { UserController } from '../controller/api/UserController.js';
import { AuthController } from '../controller/api/AuthController.js';
import { AuthMiddlewares } from '../middlewares/auth.js';
import { ScriptLeadMiddlewares } from '../middlewares/scriptLead.js';
import SwaggerUI from 'swagger-ui-express';
import apiDocs from '../docs/index.js';
import { PasswordController } from '../controller/api/PasswordController.js';
import { ResetPasswordToken } from '../middlewares/resetPasswordToken.js';
import { UploadAttachments } from '../middlewares/bucket/uploadAttachments.js';
import UploadMiddleware from '../middlewares/bucket/upload.js';
import { WhitelabelController } from '../controller/api/WhitelabelController.js';
import { AllUserController } from '../controller/api/AllUserController.js';
import { PipelineController } from '../controller/api/PipelineController.js';
import { ActivitiesController } from '../controller/api/ActivitiesController.js';
import { LeadsController } from '../controller/api/LeadsController.js';
import { LeadImportController } from '../controller/api/LeadImportController.js';
import multer from 'multer';


export const apiRouter = Router();

const usercontroller = new UserController();
const authcontroller = new AuthController();
const passwordcontroller = new PasswordController();
const whitelabelcontroller = new WhitelabelController();
const allusercontroller = new AllUserController();
const pipelineController = new PipelineController();
const activitiescontroller = new ActivitiesController();
const leadscontroller = new LeadsController();
const Leadimportcontroller = new LeadImportController();


apiRouter.use(express.json());

//rota de teste
// router.patch('/subdomain/create', whitelabelcontroller.createSubdomain)

// whitelabelcontroller


const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25mb
  }
})

apiRouter.post('/bulkImport/file/header', upload.single('file'), Leadimportcontroller.bulkImportReadFileHeader);

apiRouter.post('/bulkImport/file/body', upload.single('file'), Leadimportcontroller.bulkImportReadFileBody);

apiRouter.post('/bulkImport/file', upload.single('file'), Leadimportcontroller.bulkImportInsertBD);



apiRouter.get('/whitelabel', whitelabelcontroller.getWhitelabel);

apiRouter.post('/upload-logoV', AuthMiddlewares, UploadMiddleware, whitelabelcontroller.uploadLogoV);

apiRouter.post('/upload-logoH', AuthMiddlewares, UploadMiddleware, whitelabelcontroller.uploadLogoH);

apiRouter.post('/upload-style', AuthMiddlewares, whitelabelcontroller.uploadStyle);

// authcontroller
apiRouter.post('/auth', authcontroller.authenticate);

// passwordcontroller
apiRouter.post('/reset-password/email-send', passwordcontroller.emailSendReset);

apiRouter.put('/reset-password', ResetPasswordToken, passwordcontroller.reset);

// usercontroller
apiRouter.get('/permissions', AuthMiddlewares, usercontroller.permissions);

apiRouter.post('/me', AuthMiddlewares, usercontroller.details);

// allusercontroller
apiRouter.get('/all-users', AuthMiddlewares, allusercontroller.allUsers);

apiRouter.get('/type-users', AuthMiddlewares, allusercontroller.typeUsers);

apiRouter.post('/all-users/add', AuthMiddlewares, allusercontroller.newUser);

apiRouter.put('/all-users/edit', AuthMiddlewares, allusercontroller.editUser);

apiRouter.put('/all-users/edit-status', AuthMiddlewares, allusercontroller.editStatus);

apiRouter.put('/all-users/edit-permissions', AuthMiddlewares, allusercontroller.editPermissions);


// PipelineController
apiRouter.get('/crm/pipelines', AuthMiddlewares, pipelineController.getPipeline);

apiRouter.post('/crm/pipeline', AuthMiddlewares, pipelineController.createPipeline);

apiRouter.put('/crm/pipeline', AuthMiddlewares, pipelineController.editPipeline);

apiRouter.get('/crm/pipeline/:id_pipeline/columns', AuthMiddlewares, pipelineController.getColumns);

apiRouter.get('/crm/pipeline/lead/fields', AuthMiddlewares, pipelineController.getLeadFields);

apiRouter.get('/crm/leads', leadscontroller.getAllLeads);

apiRouter.get('/crm/pipeline/lead', AuthMiddlewares, pipelineController.getLead);

apiRouter.put('/crm/pipeline/card/:id/responsible', pipelineController.changeCard,)

apiRouter.get('/crm/pipeline/get-users-pipeline', AuthMiddlewares, pipelineController.getUserPipeline);

apiRouter.get('/crm/pipeline/lead/historic', AuthMiddlewares, pipelineController.getHistoric);

apiRouter.put('/crm/pipeline/set-value', AuthMiddlewares, pipelineController.setValue);

apiRouter.put('/crm/pipeline/set-title', AuthMiddlewares, pipelineController.setNewTitle);

apiRouter.put('/crm/pipeline/user-pipeline', AuthMiddlewares, pipelineController.setUserPipeline);

apiRouter.post('/crm/lead/obs', AuthMiddlewares, pipelineController.setObs);


// ActivitiesController
apiRouter.get('/crm/lead/activities', AuthMiddlewares, activitiescontroller.getActivities);

apiRouter.post('/crm/lead/activities', AuthMiddlewares, activitiescontroller.newActivitie);

apiRouter.put('/crm/lead/activities', AuthMiddlewares, activitiescontroller.editActivity);

apiRouter.put('/crm/lead/activities/status', AuthMiddlewares, activitiescontroller.completeActivity);


// LeadsController
apiRouter.post('/leads/save-lead', ScriptLeadMiddlewares, leadscontroller.saveLead);

apiRouter.post('/leads/save-lead-pipeline', leadscontroller.saveLeadPipeline);

apiRouter.get('/leads/all-leads', leadscontroller.allLeads)


apiRouter.get('/leads/script-collect.js', leadscontroller.scriptDataLead);

apiRouter.get('/crm/lead/activities/types', AuthMiddlewares, activitiescontroller.getTypes);

apiRouter.post('/leads/upload-attachments', UploadAttachments.single('file'), leadscontroller.uploadAttachments);

// docs
apiRouter.use('/api-docs', SwaggerUI.serve, SwaggerUI.setup(apiDocs));

apiRouter.get('/', (req, res) => {
  res.json('Backend is running');
});
