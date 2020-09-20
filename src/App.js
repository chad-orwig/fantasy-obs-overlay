import React, {useEffect, useState} from 'react';
import './App.css';
import {getWeekScores} from "./fantasy";
import styled, {css, keyframes} from 'styled-components';
import {useConfig, useInterval, useReloadOnVersionChange, useUpdatingScores} from "./hooks";
import {BrowserRouter as Router, Route, Switch,} from "react-router-dom";

const ScoreRowContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0 0;
  justify-content: space-between;
  color: white;
  font-size: 1vw;
  font-weight: bold;
  
  background: rgba(0, 0, 0, .65);
  border-radius: 1em;
`

const improvePulse = keyframes`
  0% {
    color: #FFFFFF
  }
  50% {
    color: #27ae60
  }
  100% {
    color: #FFFFFF
  }
`

const worsenPulse = keyframes`
  0% {
    color: #FFFFFF
  }
  50% {
    color: #c0392b
  }
  100% {
    color: #FFFFFF
  }
`

const changeAnimation = css`
  animation: ${props => props.change > 0 ? improvePulse : worsenPulse} 8s linear 3;
`

const GameContainer = styled.div`
  margin: 0.5em;
  padding: 0.5em;
  display: grid;
  grid-template-columns: 2fr 3fr;
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  border: 2px white;
  border-style: none none none solid;
  position: relative;
  font-size: 1vw;
`

const NameContainer = styled.div`
  white-space: nowrap;
`

const ScoreContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  text-align: end;
  vertical-align: center;
  
  ${props => props.change === 0 ? "" : changeAnimation}
`

const ProjectScoreContainer = styled.span`
  font-size: 1vw;
  font-weight: normal;
`

const Score = ({actual, projected, change, inPlay}) => {
    if(change !== 0) console.log(change);
    return (
        <ScoreContainer change={change}>
            {actual} {" "} {inPlay > 0 && `(${inPlay})`} {" "}
            <ProjectScoreContainer>
                Proj: {projected}
            </ProjectScoreContainer>
        </ScoreContainer>
    )
}

const dropdownAnimation = keyframes`
   0% {
   transform: scaleY(0)
   }
   80% {
     transform: scaleY(1.1)
   }
   100% {
     transform: scaleY(1)
   }
`

const DropdownContainer = styled.div`
  position: absolute;
  top: calc(100% + 0.5em);
  width: calc(100% - 1em + 2px);
  padding: 1em;
  background: rgba(0, 0, 0, .65);
  animation: ${dropdownAnimation} 300ms;
  transform-origin: top center;
  border-radius:  0 0 1em 1em;
`

function GameScore({home, away}) {
    return (
        <GameContainer key={`${home.name}${away.name}`}>
            <NameContainer>
                {home.name}
            </NameContainer>
            <Score
                actual={home.actual}
                projected={home.projected}
                change={home.change}
                inPlay={home.inPlay}
            />
            <NameContainer>
                {away.name}
            </NameContainer>
            <Score
                actual={away.actual}
                projected={away.projected}
                change={away.change}
                inPlay={away.inPlay}
            />
            {home.change > 0 &&
            <DropdownContainer>
                {home.name}
                <Score
                    actual={home.actual}
                    projected={home.projected}
                    change={home.change}
                />
            </DropdownContainer>}

            {away.change > 0 &&
            <DropdownContainer>
                {away.name}
                <Score
                    actual={away.actual}
                    projected={away.projected}
                    change={away.change}
                />
            </DropdownContainer>}
        </GameContainer>
    )
}

function LeagueScores() {
    const [games, setGames] = useState([]);
    const config = useConfig();

    useEffect(() => async () => {
        const newGames = await getWeekScores(games);
        setGames(newGames)
    }, []);

    useInterval(async () => {
        const newGames = await getWeekScores(games);
        setGames(newGames);
    }, config.refreshInterval);

    return (
        <ScoreRowContainer>
            {games.map(GameScore)}
        </ScoreRowContainer>
    );
}

const translate = keyframes`
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-150vw, 0);
  }
`

const bannerCss = css`
  animation: ${translate} ${props => props.scrollTime || 45}s linear infinite;
  background: rgba(0, 0, 0, .65);
  position: absolute;
  width: 150vw;
  display: grid;
  font-weight: bold;
  grid-template-columns: repeat(${props => props.columns}, 1fr);
`

const BannerContainer = styled.div`
  ${bannerCss};
  margin-left: 0;
`

const BannerContainerOffset = styled.div`
  ${bannerCss};
  margin-left: 150vw;
`

function Banner({children, scrollTime}) {
    const numChildren = React.Children.count(children);
    return (
        <div>
            <BannerContainer columns={numChildren} scrollTime={scrollTime}>
                {children}
            </BannerContainer>

            <BannerContainerOffset columns={numChildren} scrollTime={scrollTime}>
                {children}
            </BannerContainerOffset>
        </div>
    )
}

function UpdatesBanner() {
    const games = useUpdatingScores();
    const config = useConfig();
    return (
        <div>
            <Banner scrollTime={config.scrollTime}>
                {config.message?.length > 0 ? <h1> {config.message} </h1> : games.map(GameScore)}
            </Banner>
        </div>
    )
}

function App() {
    useReloadOnVersionChange();
    return (
        <Router>
            <Switch>
                <Route exact path='/'>
                    <UpdatesBanner/>
                </Route>
                <Route path='/updates'>
                    <LeagueScores/>
                </Route>
                <Route path='/matchups'>
                    <UpdatesBanner/>
                </Route>
            </Switch>
        </Router>
    )
}

export default App;
