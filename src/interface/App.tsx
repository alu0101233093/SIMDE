import * as React from 'react';
import { CodeComponent } from './CodeComponent';
import { RegisterComponent } from './RegisterComponent';
import { ReserveStationComponent } from './ReserveStationComponent';
import { FileBarComponent } from './FileBarComponent';
import { AccessBarComponent } from './AccessBarComponent';
import { Superescalar } from '../core/Superescalar';
import { FunctionalUnitComponent } from './FunctionalUnitComponent';
import { PrefetchDecoderComponent } from './PrefetchDecoderComponent';
import { RegisterMapperComponent } from './RegisterMapperComponent';
import { ReorderBufferComponent } from './ReorderBufferComponent';

class App extends React.Component<any, any> {

   constructor(props: Superescalar) {
      super(props);
   }

   render() {
      return (
         <div className='App'>
            <div className='container-fluid'>
               <FileBarComponent />
               <AccessBarComponent />
               <div className='tab-content'>
                  <div id='home' className='tab-pane fade in active'>
                     <div className='row'>
                        <div className='col-sm-3' id='code-zone'>
                           <div className='row'>
                              <CodeComponent content={this.props.machine.code} />
                           </div>
                        </div>
                        <div className='col-sm-9' id='simulation-zone'>
                           <div className='row'>
                              <div className='col-sm-5'>
                                 <div className='row'>
                                    <div className='col-sm-6'>
                                       <div className='row'>
                                          <PrefetchDecoderComponent title='Prefetch' />
                                       </div>
                                    </div>
                                    <div className='col-sm-6'>
                                       <div className='row'>
                                          <PrefetchDecoderComponent title='Decoder' />
                                       </div>
                                    </div>
                                 </div>
                                 <div className='row'>
                                    <div className='col-sm-4'>
                                       <div className='row'>
                                          <RegisterMapperComponent title='ROB<->GPR' />
                                       </div>
                                    </div>
                                    <div className='col-sm-4'>
                                       <div className='row'>
                                          <RegisterMapperComponent title='ROB<->FPR' />
                                       </div>
                                    </div>
                                    <div className='col-sm-4'>
                                       <div className='row'>
                                          <RegisterMapperComponent title='Jump' />
                                       </div>
                                    </div>
                                 </div>
                                 <div className='row'>
                                    <ReorderBufferComponent />
                                 </div>
                              </div>
                              <div className='col-sm-5'>
                                 <div className='row'>
                                    <div className='col-sm-12'>
                                       <div className='row'>
                                          <div className='panel panel-default inside-bar' id='reserve-station-zone'>
                                             <div className='panel-heading'>Reserve Stations</div>
                                             <div className='panel-body'>
                                                <div className='row'>
                                                   <div className='panel panel-default'>
                                                      <ReserveStationComponent title='Integer +' />
                                                      <ReserveStationComponent title='Integer x' />
                                                      <ReserveStationComponent title='Floating +' />
                                                      <ReserveStationComponent title='Floating x' />
                                                      <ReserveStationComponent title='Memoru' />
                                                      <ReserveStationComponent title='Jump' />
                                                   </div>
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                              <div className='col-sm-2'>
                                 <div className='row'>
                                    <div className='col-sm-12'>
                                       <div className='row'>
                                          <div className='panel panel-default inside-bar' id='functional-unit-zone'>
                                             <div className='panel-heading'>U. F.</div>
                                             <div className='panel-body'>
                                                <div className='row'>
                                                   <FunctionalUnitComponent title='+Entera' />
                                                   <FunctionalUnitComponent title='xEntera' />
                                                   <FunctionalUnitComponent title='+Flotante' />
                                                   <FunctionalUnitComponent title='xFlotante' />
                                                   <FunctionalUnitComponent title='Mem' />
                                                   <FunctionalUnitComponent title='Jump' />
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div id='menu1' className='tab-pane fade'>
                     <div className='row'>
                        <div className='col-sm-4'>
                           <RegisterComponent title='Memoria' />
                        </div>
                        <div className='col-sm-4'>
                           <RegisterComponent title='Registros generales' />
                        </div>
                        <div className='col-sm-4'>
                           <RegisterComponent title='Registros de punto flotante' />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }
}

export default App;
