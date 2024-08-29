// import { notificationClient } from '../BD/BDConect.js';
import getPipeline from '../controller/ws/functions/getPipeline.js';
import { PipelineControllerWS } from '../controller/ws/PipelineControllerWS.js';

export function wsRoutes(io) {
  const pipelinecontroller = new PipelineControllerWS(io);

  io.of('/crm/pipeline').on('connection', pipelinecontroller.pipeline);
  io.of('/crm/pipeline').on('connection', pipelinecontroller.moveCard);


  // notificationClient.on('notification', (msg) => {
  //   const row = JSON.parse(msg.payload);
  //   const room = `client_${row.id_client}_pipeline_${row.id}`;
  //   const roomInfo = pipelinecontroller.rooms.get(room);

  //   if (msg.channel === 'update_pipeline') {
  //     // (async () => {
  //     //   let pipeline = []
  //     //   await row.content.map((subPipeline) => {
  //     //     const subtypeSubpipeline = Object.keys(subPipeline)[0];
  //     //     roomInfo.view_indice.includes(subtypeSubpipeline) && pipeline.push(subPipeline)
  //     //   })
  //     //   io.of('/crm/pipeline').to(room).emit('update-pipeline', { updated: pipeline });
  //     // })()
  //   }
  //   if (msg.channel === 'move_card') {
  //     (async () => {
  //       await getPipeline.Cards({ id_user: roomInfo.id_user, id_client: row.id_client, id_pipeline: row.id }, io.of('/crm/pipeline'));
  //     })()
  //   }
  // });
}
