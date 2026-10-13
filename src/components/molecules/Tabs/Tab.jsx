import React, { Component } from 'react';
import styled from 'styled-components';
import { AppThemeProvider } from '../../../theme';

// modern tabs: the active tab is marked with an accent underline (no filled block)
const Active = styled.li`
    display: inline-block;
    list-style: none;
    margin-bottom: 0px;
    padding: 0 1.2vw;
    font-size: 2.2vh;
    font-weight: 600;
    height: 6.66vh; // 11/12 of 80%
    line-height: 6.66vh; // 11/12 of 80%
    color: ${props => props.theme?.title?.text ?? 'inherit'};
    box-shadow: inset 0 -3px 0 ${props => props.theme?.button?.primary?.background ?? '#dd9933'};
    cursor: default;
`

const Inactive = styled.li`
    display: inline-block;
    list-style: none;
    margin-bottom: 0px;
    padding: 0 1.2vw;
    font-size: 2.2vh;
    height: 6.66vh; // 11/12 of 80%
    line-height: 6.66vh; // 11/12 of 80%
    color: ${props => props.theme?.title?.text ?? 'inherit'};
    opacity: 0.65;
    cursor: pointer;
    transition: opacity .15s ease, background .15s ease;

    &:hover {
      opacity: 1;
      background: rgba(255,255,255,0.06);
    }
`

export class Tab extends Component {
    onClick = () => {
      const { label, onClick } = this.props;
      if (onClick) {
        onClick(label);
      }
    }
  
    render() {
      const { activeTab, label } = this.props;
  
  
      if (activeTab === label) {
        return (
            <AppThemeProvider>
              <Active
                className='tab-list-item tab-list-active'
                onClick={()=>this.onClick()}
              >
                {label}
              </Active>
            </AppThemeProvider>
          );
      }
      else {
        return (
          <AppThemeProvider>
            <Inactive
                className='tab-list-item'
                onClick={()=>this.onClick()}
              >
                {label}
              </Inactive>
            </AppThemeProvider>
          );
    
      }


  
    }
  }
  