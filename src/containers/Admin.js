import React, {Component} from 'react';
import {connect} from 'react-redux';
import {attachCallbackEvents, detachCallbackEvents, update} from '../actions/event';

import {TextField, RaisedButton, List, ListItem, Toggle} from 'material-ui';

class Admin extends Component {
    constructor(props) {
        super(props);
        this.editEvent = this.editEvent.bind(this);
        this.saveEvent = this.saveEvent.bind(this);
        this.cancelSaveEvent = this.cancelSaveEvent.bind(this);
        this.toggleEvent = this.toggleEvent.bind(this);

        this.state = {
            isEditEvent: false
        }
    }

    editEvent() {
        this.setState({
            isEditEvent: true
        })
    }

    saveEvent(e) {
        e.preventDefault();

        let name = this.refs.eventName.getValue();

        if(name) {
            const event = {
                name: name,
                description: null,
                isClosed: false
            };

            this.props.dispatch(update(event));
        }

        this.setState({
            isEditEvent: false
        });

        this.refs.eventName.setValue('');
    }

    cancelSaveEvent(e) {
        e.preventDefault();

        this.setState({
            isEditEvent: false
        });

        this.refs.eventName.setValue('');
    }

    toggleEvent(key, e) {
        e.preventDefault();

        let event = this.props.events[key];

        event.isClosed = !event.isClosed;
        this.props.dispatch(update(event, key));
    }

    componentWillMount() {
        this.props.dispatch(attachCallbackEvents());
    }

    componentWillUnmount() {
        this.props.dispatch(detachCallbackEvents());
    }

    render() {
        let eventEdit;

        if (this.state.isEditEvent) {
            eventEdit = <div data-layout="column" data-layout-align="center center">
                            <div className="edit-event">
                                <TextField ref="eventName" hintText="Event Name" floatingLabelText="Event Name"/>

                                <div data-layout="row" data-layout-align="space-between center">
                                    <RaisedButton label="SAVE EVENT" primary={true} onClick={this.saveEvent}/>
                                    <RaisedButton label="CANCEL" secondary={true} onClick={this.cancelSaveEvent}/>
                                </div>
                            </div>
                        </div>;
        }
        else {
            eventEdit = <div data-layout="column" data-layout-align="center center" data-layout-margin>
                            <RaisedButton label="ADD EVENT" primary={true} onClick={this.editEvent}/>
                        </div>;
        }

        let listItemStyle = {
            'fontSize': '1.5em'
        };

        return (
            <div>
                {eventEdit}                                
                <div>
                    <List>
                        {
                            Object.keys(this.props.events).map((key, i) => {                                
                                if (!this.props.events[key].isClosed) {
                                    let selectedEvent = this.props.events[key];
                                    let rightToggle =
                                        <Toggle defaultToggled={!this.props.events[key].isClosed} 
                                                onToggle={this.toggleEvent.bind(this, key)}/>;

                                    return <ListItem key={i} primaryText={<div style={listItemStyle}>{this.props.events[key].name}</div>}
                                                     rightToggle={rightToggle} 
                                                    secondaryText={
                                                        <p>
                                                            <span>
                                                                Username: {selectedEvent.admin.email}
                                                            </span>
                                                            <br/>
                                                            <span>
                                                                Password: {selectedEvent.admin.password}
                                                            </span>
                                                        </p>
                                                     } secondaryTextLines={2}/>;
                                }
                            })
                        }
                        {
                            Object.keys(this.props.events).map((key, i) => {
                                let event = this.props.events[key];
                                if (event.isClosed) {
                                    return <ListItem key={i} primaryText={<div style={listItemStyle}>{event.name}</div>}
                                                     rightToggle={<Toggle defaultToggled={!event.isClosed}                                                     
                                      onToggle={this.toggleEvent.bind(this, key)}/>}/>;
                                }
                            })
                        }
                    </List>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const {auth, event} = state;

    let divs = [];
    let events = event.events || {};

    return {
        events: events
    };
}

export default connect(mapStateToProps)(Admin);