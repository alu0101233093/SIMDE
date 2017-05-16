import * as React from 'react';
declare var window: any;

export class RegisterComponent extends React.Component<any, any> {

   constructor(props: any) {
      super(props);
      this.state = {
         title: null,
         content: new Array(64).fill(0),
         contentShowable: [],
         show: [1, 8]
      };
      window.state[this.props.title] = (data) => {
         console.log('Calling register back');
         let newState = {
            content: data.content.slice(),
            contentShowable: []
         };
         newState.contentShowable = data.content.slice(this.state.show[0], this.state.show[1]);
         this.setState(newState);
      };
   }

   render() {
      return (
         <div className='panel panel-default'>
            <div className='panel-heading'>{this.props.title}</div>
            <div className='panel-body'>
               <table className='table table-bordered'>
                  <tbody>
                     {
                        this.state.contentShowable.map((row, i) => <tr key={`${this.state.title + i}`}>
                           <td key={`${this.state.title + i + 65}`}>{i}</td>
                           <td key={`${this.state.title + i + 131}`}>{row}</td>
                        </tr>)
                     }
                  </tbody>
               </table>
            </div>
            <div className='panel-footer'>
               <button type='button' className='btn'><i className='fa fa-plus' aria-hidden='true'></i>
               </button>
               <button type='button' className='btn'><i className='fa fa-minus' aria-hidden='true'></i></button>
               <button type='button' className='btn'><i className='fa fa-check' aria-hidden='true'></i></button>
               <button type='button' className='btn'><i className='fa fa-times' aria-hidden='true'></i></button>
               <button type='button' className='btn'><i className='fa fa-repeat' aria-hidden='true'></i></button>
            </div>
         </div>);
   }
}
