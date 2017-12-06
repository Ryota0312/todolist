import React from 'react';
import ReactDOM from 'react-dom';
var request = require("superagent")

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            children: {},
        };
        this.handleMissionSubmit = this.handleMissionSubmit.bind(this);
        this.handleMissionDelete = this.handleMissionDelete.bind(this);
        this.handleMissionUpdate = this.handleMissionUpdate.bind(this);
        this.handleArrowClick = this.handleArrowClick.bind(this);
        this.handleAddTextClick = this.handleAddTextClick.bind(this);
    }

    componentDidMount() {
        request
            .get(this.props.url + ".json")
            .set('Content-Type', 'application/json')
            .end((err, res) => {
                if(err){
                    console.log(this.props.url)
                } else {
                    var children = {};
                    for (var i = 0; i < res.body.length; i++) {
                        res.body[i].collapsed = true;
                        res.body[i].form_collapsed = true;
                        if (res.body[i].parent_id != null) {
                            if (!children[res.body[i].parent_id]) {
                                children[res.body[i].parent_id] = [];
                            }
                            children[res.body[i].parent_id].push(res.body[i]);
                        }
                    }
                    this.setState({
                        data: res.body,
                        children: children
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
                    res.body.collapsed = true;
                    res.body.form_collapsed = true;
                    var children = this.state.children;
                    if (res.body.parent_id != null) {
                        if (!children[res.body.parent_id]) {
                            children[res.body.parent_id] = [];
                        }
                        children[res.body.parent_id].push(res.body);
                    }
                    var missions = this.state.data;
                    var newMissions = missions.concat(res.body);
                    this.setState({
                        data: newMissions,
                        children: children
                    });
                }
            })
    }

    handleMissionDelete(id, parent_id) {
        var newMissions = this.state.data
            .filter(function(mission) {
                return mission.id != id
            });
        var newChildren = this.state.children;
        if (parent_id != null && this.state.children[parent_id]) {
            newChildren = {};
            for (var key in this.state.children) {
                if (key == parent_id) {
                    newChildren[key] = this.state.children[key]
                        .filter(function(child) {
                            return child.id != id;
                        });
                } else {
                    newChildren[key] = this.state.children[key];
                }
            }
        }

        request
            .del(this.props.url + '/' + id + ".json")
            .set('X-CSRF-Token', this.getCsrfToken())
            .end((err, res) => {
                if(err) {
                    console.log('error')
                } else {
                    this.setState({
                        data: newMissions,
                        children: newChildren
                    })
                }
            })
    }

    handleMissionUpdate(mission) {
        request
            .patch(this.props.url + '/' + mission.mission.id + '.json')
            .set('X-CSRF-Token', this.getCsrfToken())
            .send(mission)
            .end((err, res) => {
                if(err) {
                    console.log('error')
                }
            })
    }

    handleArrowClick(id) {
        var newMissions = this.state.data
            .map(function(mission) {
                if (mission.id == id) {
                    mission.collapsed = !mission.collapsed;
                }
                return mission;
            });
        this.setState({
            data: newMissions
        })
    }

    handleAddTextClick(id) {
        var newMissions = this.state.data
            .map(function(mission) {
                if (mission.id == id) {
                    mission.form_collapsed = !mission.form_collapsed;
                }
                return mission;
            });
        this.setState({
            data: newMissions
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
                <Todolist data={this.state.data} children={this.state.children} onMissionDelete={this.handleMissionDelete} onMissionUpdate={this.handleMissionUpdate} onArrowClick={this.handleArrowClick} onAddTextClick={this.handleAddTextClick} onMissionSubmit={this.handleMissionSubmit} />
                <MissionForm parent_id="" onMissionSubmit={this.handleMissionSubmit} />
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
                <input type="hidden" className="form-control" value={this.props.parent_id} ref="parent_id" />
                <input type="submit" className="btn" value="Create" />
                </div>
                </form>
        );
    }
}

class Todolist extends React.Component {
    render() {
        var missions = this.props.data
            .filter(function(mission) {
                return mission.parent_id == null;
            })
            .map(function(mission) {
                return (
                        <MissionTreeView key={mission.id} mission={mission} children={this.props.children} onMissionDelete={this.props.onMissionDelete} onMissionUpdate={this.props.onMissionUpdate} onArrowClick={this.props.onArrowClick} onAddTextClick={this.props.onAddTextClick} onMissionSubmit={this.props.onMissionSubmit} />
                );
            }.bind(this));

        return (
            <div className="todo-list">
                {missions}
            </div>
        );
    }
}

class MissionTreeView extends React.Component {
    render() {
        var mission = this.props.mission;
        var arrowClass = "tree-view_arrow";
        var childrenClass = 'tree-view_children';
        if (mission.collapsed) {
            arrowClass += " tree-view_arrow-collapsed";
            childrenClass += ' tree-view_children-collapsed';
        }

        var childrenContainer = null;
        if (mission.id != null && this.props.children[mission.id]) {
            childrenContainer = this.props.children[mission.id]
                .map(function(child) {
                    return (
                            <MissionTreeView key={child.id} mission={child} children={this.props.children} onMissionDelete={this.props.onMissionDelete} onMissionUpdate={this.props.onMissionUpdate} onArrowClick={this.props.onArrowClick} onAddTextClick={this.props.onAddTextClick} onMissionSubmit={this.props.onMissionSubmit} />
                    );
                }.bind(this));
        }

        var addFormContainer = (
                <MissionForm parent_id={mission.id} onMissionSubmit={this.props.onMissionSubmit} />
        );

        return (
                <div className="tree-view">
                <Mission key={mission.id} id={mission.id} title={mission.title} desc={mission.desc} state={mission.state} parent_id={mission.parent_id} arrowClass={arrowClass} onMissionDelete={this.props.onMissionDelete} onMissionUpdate={this.props.onMissionUpdate} onArrowClick={this.props.onArrowClick} onAddTextClick={this.props.onAddTextClick} />
                <div className={mission.form_collapsed ? "add-form_collapsed" : ""}>
                {mission.form_collapsed ? null : addFormContainer}
                </div>
                <div className={childrenClass}>
                {mission.collapsed ? null : childrenContainer}
                </div>
                </div>
        );
    }
}

class Mission extends React.Component {
    handleDelete(e) {
        e.preventDefault();
        this.props.onMissionDelete(this.props.id, this.props.parent_id);
    }

    handleUpdate(e) {
        e.preventDefault();
        this.props.onMissionUpdate({mission: {id: this.props.id,
                                              state: e.target.value}});
    }

    handleClick(e) {
        e.preventDefault();
        this.props.onArrowClick(this.props.id);
    }

    handleAddTextClick(e) {
        e.preventDefault();
        this.props.onAddTextClick(this.props.id);
    }

    render() {
        return (
                <div className="tree-view_item">
                <div className={this.props.arrowClass} onClick={this.handleClick.bind(this)}/>
                <div className="tree-view_cell">
                {this.props.title}
                </div>
                <div className="tree-view_cell">
                <select className="form-control" defaultValue={this.props.state} onChange={this.handleUpdate.bind(this)}>
                <option value="TODO" key="TODO">TODO</option>
                <option value="DOING" key="DOING">DOING</option>
                <option value="DONE" key="DONE">DONE</option>
                </select>
                </div>
                <div className="tree-view_cell">
                <span className="add-form_link" onClick={this.handleAddTextClick.bind(this)}>Add Mission</span>
                </div>
                <div className="tree-view_cell">
                <button className="btn btn-danger" onClick={this.handleDelete.bind(this)}>delete</button>
                </div>
                </div>
        );
    }
}

ReactDOM.render(
        <App url="missions" />,
    document.getElementById("content")
);
