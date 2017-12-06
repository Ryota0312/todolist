import React from 'react';
import ReactDOM from 'react-dom';
var request = require("superagent")

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
        };
        this.handleMissionSubmit = this.handleMissionSubmit.bind(this);
        this.handleMissionDelete = this.handleMissionDelete.bind(this);
    }

    componentDidMount() {
        request
            .get(this.props.url + ".json")
            .set('Content-Type', 'application/json')
            .end((err, res) => {
                if(err){
                    console.log(this.props.url)
                } else {
                    this.setState({
                        data: res.body
                    })
                }
            })
    }

    handleMissionSubmit(mission) {
        request
            .post(this.props.url + ".json")
            .set('X-CSRF-Token', this.getCsrfToken())
            .send(mission)
            .end((err, res) => {
                if(err) {
                    console.log('error')
                } else {
                    var missions = this.state.data;
                    var newMissions = missions.concat(res.body);
                    this.setState({data: newMissions});
                }
            })
    }

    handleMissionDelete(id) {
        var newMissions = this.state.data
            .filter(function(mission) {
                return mission.id != id
            });
        request
            .del(this.props.url + '/' + id + ".json")
            .set('X-CSRF-Token', this.getCsrfToken())
            .end((err, res) => {
                if(err) {
                    console.log('error')
                } else {
                    this.setState({
                        data: newMissions
                    })
                }
            })
    }

    getCsrfToken() {
        var meta = document.getElementsByTagName('meta');
        for (var elem in meta) {
            if (meta[elem].name === 'csrf-token') {
                return meta[elem].content;
            }
        }
    }

    render() {
        return (
                <div className="app">
                <h1>Todolist</h1>
                <Todolist data={this.state.data} onMissionDelete={this.handleMissionDelete} />
                <MissionForm parentId="" onMissionSubmit={this.handleMissionSubmit} />
                </div>
        );
    }
}

class MissionForm extends React.Component {
    handleSubmit(e) {
        e.preventDefault();
        var title = ReactDOM.findDOMNode(this.refs.title).value.trim();
        var desc = ReactDOM.findDOMNode(this.refs.desc).value.trim();
        var parent_id = ReactDOM.findDOMNode(this.refs.parent_id).value.trim();
        if (!title) {
            return;
        }
        this.props.onMissionSubmit({mission: {title: title,
                                              desc:  desc,
                                              parent_id: parent_id,
                                              state: 'TODO'
                                             }
                                   });
        ReactDOM.findDOMNode(this.refs.title).value = '';
        ReactDOM.findDOMNode(this.refs.desc).value = '';
        return;
    }

    render() {
        return (
                <form className="todoForm" onSubmit={this.handleSubmit.bind(this)}>
                <div className="input-group">
                <input type="text" className="form-control" placeholder="Title" ref="title" />
                <input type="text" className="form-control" placeholder="Desc" ref="desc" />
                <input type="hidden" className="form-control" value={this.props.parentID} ref="parent_id" />
                <input type="submit" className="btn" value="Create" />
                </div>
                </form>
        );
    }
}

class Todolist extends React.Component {
    render() {
        var missions = this.props.data.map(function(mission) {
            return (
                    <Mission key={mission.id} id={mission.id} title={mission.title} desc={mission.desc} state={mission.state} onMissionDelete={this.props.onMissionDelete}/>
            );
        }.bind(this));

        return (
           <div className="todo">
                <table>
                <thead>
                <tr>
                <td> Title </td>
                <td> State </td>
                </tr>
                </thead>
                <tbody>
                {missions}
                </tbody>
                </table>
            </div>
        );
    }
}

class Mission extends React.Component {
    handleDelete(e) {
        e.preventDefault();
        this.props.onMissionDelete(this.props.id);
    }

    render() {
        return (
                <tr>
                <td>{this.props.title}</td>
                <td>{this.props.state}</td>
                <td>
                <button className="btn btn-danger" onClick={this.handleDelete.bind(this)}>delete</button>
                </td>
                </tr>
        );
    }
}

ReactDOM.render(
        <App url="missions" />,
    document.getElementById("content")
);
