import React from 'react';
import './ImageLinkForm.css'

const ImageLinkForm = ({onInputChange , onButtonSubmit}) => {
    return (
        <div>
            <p className='f3'>
                {'This Magic Brain will detect your friends. Give it a chance!'}
            </p>
            <div className='center'>
                <div className='form center pa4 br-3 shadow-5' >
                    <input className='f4 pa2 w-70 center' type='text' onChange={onInputChange}></input>
                    <button className='w-30 grow f4 link ph3 pv2 dib white bg-light-purple' type='submit' onClick={onButtonSubmit}>Detect</button>
                </div>                
            </div>
        </div>
    )
}

export default ImageLinkForm;