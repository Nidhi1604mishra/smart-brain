import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import './App.css';
import { useCallback } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";


const initialState = {
  input: '',
  imageurl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: '',
    joined:''
  }
}

function App() {
  const [input, setInput] = useState(initialState.input);
  const [responseJson] = useState();
  const [imageURL, setImageURL] = useState(initialState.imageurl);
  const [box, setBox] = useState(initialState.box);
  const [route, setRoute] = useState(initialState.route)
  const [isSignedIn, setSignedIn] = useState(initialState.isSignedIn)
  const [user, setUser] = useState(initialState.user);

  const loadUser = (data) => {
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    });
  }

  const calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  const displayFaceBox = (box) => {
    console.log(box)
    setBox(box);
  }
  useEffect(() => { }, [box]);

  const onInputChange = (event) => {
    const inputValue = event.target.value;
    setInput(inputValue);
  }

  const onButtonSubmit = () => {
    setImageURL(input);
    console.log('click');
  }

  const onRouteChange = (route) => {
    if(route === 'signout') {
      setSignedIn(false)
      setRoute(route);
      setUser(initialState.user); 
      setImageURL(initialState.imageurl); 
      setBox(initialState.box);
    } else if(route === 'home') {
      setSignedIn(true)
    }
    setRoute(route);
  }

  useEffect(() => {
    const PAT = '9b5bd2dabf5f415bb1565131c5da6053';
    const USER_ID = 'mishra411';
    const APP_ID = 'apiTest';
    const MODEL_ID = 'general-image-detection';
    const MODEL_VERSION_ID = '1580bb1932594c93b7e2e04456af7c6f';

    if (imageURL) {
      const data = {
        user_app_id: {
          user_id: USER_ID,
          app_id: APP_ID
        },
        inputs: [
          {
            data: {
              image: {
                url: imageURL
              }
            }
          }
        ]
      };

      const headers = {
        Accept: 'application/json',
        Authorization: `Key ${PAT}`
      };

      fetch(`https://api.clarifai.com/v2/users/clarifai/apps/main/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(data => {
          if(data) {
            fetch('http://localhost:3000/image', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: user.id,
              })
            })
            .then(response => response.json())
            .then(count => {
              setUser(Object.assign(user, { entries: count }))
            })
            .catch(console.log)
          }
          console.log(data)
          displayFaceBox(calculateFaceLocation(data));
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  }, [imageURL, user]);

  const particlesInit = useCallback(async engine => {
    console.log(engine);
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async container => {
    await console.log(container);
  }, []);

  return (
    <div className="App">
      <Particles className='particles'
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "grab",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 6,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "square",
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
      />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      {route === 'home' ? (
        <div>
          <Logo />
          <Rank
           name={user.name} 
           entries={user.entries} 
          />
          <ImageLinkForm
           value={input} 
           onInputChange={onInputChange} 
           onButtonSubmit={onButtonSubmit}
          />
          <pre>{JSON.stringify(responseJson, null, 2)}</pre>
          <FaceRecognition
            box={{box}}
            imageURL={imageURL}>
            <img src={imageURL} alt="" />
          </FaceRecognition>
        </div>
      )
        : (
          route === 'signin'
            ? (<Signin onRouteChange={onRouteChange} loadUser={loadUser}/>)
            : (<Register loadUser={loadUser} onRouteChange={onRouteChange} />)
        )
      }
    </div>
  );
}


export default App;
