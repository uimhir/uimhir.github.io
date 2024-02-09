import {Component, createRef} from 'react';

import parse from "./parse.js";

class App extends Component {
    
    constructor(params) {
        super(params);
        this.warnings = [];
        this.state = {language:"english", 
                      number: "", 
                      context: "counting", 
                      noun: "", 
                      minSimple: 100,
                      result: ""};      
        this.startState= {...this.state};
        delete this.startState.language; // Don't switch languages on a reset.
    }
    

    changeLanguage() {
        let newLang = this.state.language;
        if (newLang == "irish") {
            newLang = "english";
        } else {
            newLang = "irish";
        }
        this.setState({language:newLang});
    }
    
    updateNumber(e) {
        this.setState({number:e.target.value}, this.mayShow.bind(this));
    }
    updateNoun(e) {        
        this.setState({noun:e.target.value}, this.mayShow.bind(this));
    }
    updateSimpleLimit(e) {
        this.setState({minSimple:e.target.value}, this.mayShow.bind(this));
    }
    
    updateContext(e) {
        this.setState({context: e.target.value}, this.mayShow.bind(this));
    }
    
    reset() {
        let copy = {...this.startState};
        this.setState(copy);
    }
    
    warn(msg) {
        this.warnings.push(msg);
    }
    
    setResult(text) {
        this.setState({result: text});
    }
    
    mayShow() {
        let num = parseFloat(this.state.number);
        if (!Number.isNaN(num)) {
            this.show();
        }
    }
    show() {
        parse(this, this.state);
    }
    
    render() {
        let l   = this.state.language;
        let changeTo = "In English";
        if (l == "english") {
            changeTo = "As nGaeilge";
        }
        let wn = [];
        if (this.warnings.length > 0) {
            for (let i=0; i<this.warnings.length; i += 1) {
                wn[i] = <li key={i}>{this.warnings[i]}</li>;
            }
            // We'll lose the warnigns as soon as we re-render.
        }
        this.warnings = [];
        if (l == "english") {
            return this.renderEn(wn, changeTo);
        } else if (l == "irish") {
            return this.renderGa(wn, changeTo);
        } else {
            return this.unknownLanguage(); 
        }
    }
    
    unknownLanguage() {
        return (<div>Unknown Language</div>);
    }
    
    renderEn(wn, changeTo) {
        return ( 
                <div>
        <button onClick={this.changeLanguage.bind(this)}>{changeTo}</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="help.html">Help</a><br/>
                    <h2> Rendering Irish Numbers into text </h2>
                    Enter a number and select the options to rendering in Irish words.
                      <hr/><br/>
                      <table><tbody>
                      <tr><th align="right">Number:</th><td><input id="number" size="20" value={this.state.number} onChange={this.updateNumber.bind(this)}/></td></tr>
                      <tr><th align="right">Context:</th><td>
                    <select id="selbox" value={this.state.context} onChange={this.updateContext.bind(this)} >                     
                        <option value="counting">Abstract Numbers and Arithmetic</option>
                        <option value="objects">Counting Things</option>                        
                        <option value="people">Counting People</option>
                        <option value="ordinal">Ordering Things or People</option>
                        </select></td></tr>
                        <tr><th align="right">Noun:</th><td><input id="noun" size="15" value={this.state.noun} onChange={this.updateNoun.bind(this)}/></td></tr>
                      <tr><th align="right">Simplified above:</th><td><input id="minSimple" size="10" value={this.state.minSimple}
                       onChange={this.updateSimpleLimit.bind(this)} /></td></tr> 
                       </tbody></table>
                       <hr/>
                    <button onClick={this.reset.bind(this)}> Reset</button>
                      <hr/> <strong>Result:</strong><p/>
                    <div id="result" >{this.state.result}</div>
                    <ul>{wn}</ul>
                </div>
        );
    }
    
    renderGa(wn, changeTo) {
        return ( 
                <div>
                    <button onClick={this.changeLanguage.bind(this)}>{changeTo}</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="help.html">Help</a><br/>
                    <h2>Uimhreacha Gaeilge a Chur i bhFocail </h2>
                      Iontráil uimhir agus roghnaigh na roghanna chun focail Gaeilge a rindreáil.                      <hr/><br/>
                      <table><tbody>
                      <tr><th align="right">Uimhir:</th><td><input id="number" size="20" value={this.state.number} onChange={this.updateNumber.bind(this)}/></td></tr>
                      <tr><th align="right">Cineál uimhir:</th><td>
                    <select id="selbox" value={this.state.context} onChange={this.updateContext.bind(this)} >                     
                        <option value="counting">Maoluimhir</option>
                        <option value="objects">Bunuimhir</option>                        
                        <option value="people">Uimhir Phearsanta</option>
                        <option value="ordinal">Orduimhir</option>
                        </select></td></tr>
                        <tr><th align="right">Ainmfhocal:</th><td><input id="noun" size="15" value={this.state.noun} onChange={this.updateNoun.bind(this)}/></td></tr>
                      <tr><th align="right">Simplithe thuas:</th><td><input id="minSimple" size="10" value={this.state.minSimple}
                       onChange={this.updateSimpleLimit.bind(this)} /></td></tr> 
                       </tbody></table>
                      <hr/>
                    <button onClick={this.reset.bind(this)}> Athshocrú </button>
                    <hr/> <strong>Toradh:</strong><p/>
                    <div id="result" >{this.state.result}</div>
                    <ul>{wn}</ul>
                </div>
        );
    }
}

export default App;
