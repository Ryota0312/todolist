import React from 'react';
import ReactDOM from 'react-dom';
var request = require("superagent")

class App extends React.Component {
    constructor(props) {
	super(props);
	this.state = {
	    data: [],
	};
    }
    
    componentDidMount() {
	request
	    .get(this.props.url)
	    .set('Content-Type', 'application/json')
	    .end((err, res) => {
		if(err){
		    console.log(this.props.url)
		}
		this.setState({
		    data: res.body
		})
	    })
    }
    
    render() {
	return (
		<div className="app">
		<h1>Todolist</h1>
		<Todolist data={this.state.data} />
		</div>
	);
    }
}

class Todolist extends React.Component {
    render() {
	var missions = this.props.data.map(function(mission) {
	    return (
		    <Mission key={mission.id} title={mission.title} desc={mission.desc} state={mission.state} />
	    );
	}.bind(this));
	
	return (
		<div className="todo">
		{missions}
	    </div>
	);
    }
}

class Mission extends React.Component {
    render() {
	return (
		<div className="mission">
		<tbody>
		<tr>
		<td>{this.props.title}</td>
		<td>{this.props.state}</td>
		</tr>
		</tbody>
	    </div>
	);
    }
}

ReactDOM.render(
	<App url="missions.json" />,
    document.getElementById("content")
);
