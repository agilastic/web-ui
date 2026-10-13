import styled from 'styled-components';

const ImageBackground = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'zIndex',
})`
    z-index: ${props => props.zIndex};
    position: absolute;
    overflow: hidden;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    padding: 0;
    margin: 0;
    height: 100%;
    width:100%;
    background: linear-gradient(to bottom,rgba(128,128,255,1) 0%,rgba(245,245,245,1) 100%);
    background-image: url(${props => props.url ? props.url:"images/background.jpg"});
    background-size: cover;
    /* light blur only - the photo stays recognisable; slightly darkened so text on top stays readable,
       scaled up a little so the blurred edges don't show */
    filter: blur(2px) brightness(0.85);
    -webkit-filter: blur(2px) brightness(0.85);
    transform: scale(1.02);
`;



export default ImageBackground