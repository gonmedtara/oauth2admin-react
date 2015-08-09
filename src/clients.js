// -ClientsCRUD
//   -SearchBar
//   -ClientList
//     -Client
//       -ClientActions
//       -ClientDetails (Modal)
//     -NewClientForm (Modal)

var ClientsCRUD = React.createClass({
    getInitialState: function() {
        return {
            clients: [],
            filterText: ''
        };
    },
    handleUserInput: function(filterText) {
        this.setState({filterText: filterText});
    },
    componentDidMount: function() {
        this.loadClients();
    },
    loadClients: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'get',
            success: function(data) {
                this.setState({clients: data.client});
            }.bind(this),
            error: function(xhr, status, error) {
                console.log(xhr, status, error);
            }.bind(this)
        });
    },
    handleUpdate: function(data) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'post',
            success: function(data) {
                console.log(data);
                this.loadClients();
            }.bind(this),
            error: function(xhr, status, error) {
                console.log(xhr, status, error);
            }.bind(this)
        });
    },
    render: function() {
        return (
            <div className="clientsCRUD">
                <SearchBar filterText={this.state.filterText} onUserInput={this.handleUserInput} />
                <ClientList
                    clients={this.state.clients}
                    filterText={this.state.filterText}
                    onUpdate={this.handleUpdate}
                />
            </div>
        );
    }
});

var SearchBar = React.createClass({
    handleChange: function() {
        this.props.onUserInput(this.refs.filterTextInput.getDOMNode().value);
    },
    render: function() {
        return (
            <div className="searchBar">
                <button className="ui right floated small primary button">Create</button>
                <div className="ui small form">
                    <div className="six wide inline field">
                        <input
                            type="text"
                            placeholder="Filter by id"
                            ref="filterTextInput"
                            value={this.props.filterText}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
            </div>
        );
    }
});

var ClientList = React.createClass({
    render: function() {
        var items = [];
        var filterText = this.props.filterText;
        this.props.clients.forEach(function(client) {
            if (client.client_id.indexOf(filterText) == -1) {
                return;
            }
            items.push(<Client key={client.client_id} data={client} onUpdate={this.props.onUpdate}/>);
        }.bind(this));
        return (
            <div className="clientList ui middle aligned divided list">
                {items}
            </div>
        );
    }
});

var Client = React.createClass({
    getInitialState: function() {
        return {
            detailsOpen: false,
            updateOpen: false
        };
    },
    toggleDetails: function() {
        this.setState({detailsOpen: !this.state.detailsOpen});
    },
    toggleUpdate: function() {
        this.setState({updateOpen: !this.state.updateOpen});
    },
    render: function() {
        var data = this.props.data;
        return (
            <div className="client item">
                <div className="right floated content">
                    <ClientActions
                        updateHandler={this.toggleUpdate}
                        updateOpen={this.state.updateOpen}
                        data={data}
                        onUpdate={this.props.onUpdate}
                    />
                </div>
                <div className="content" onClick={this.toggleDetails}>
                    <i className="spy icon"></i>
                    <span>{data.client_id}</span>
                </div>
                <ClientDetails data={data} open={this.state.detailsOpen} handler={this.toggleDetails} />
            </div>
        );
    }
});

var ClientActions = React.createClass({
    handleUpdate: function(data) {
        this.props.onUpdate(data);
    },
    render: function() {
        return (
            <div className="clientActions ui horizontal divided list">
                <div className="item" onClick={this.props.updateHandler}>
                    <div className="content">
                        <i className="configure primary icon"></i>
                    </div>
                </div>
                <ClientUpdate
                    data={this.props.data}
                    open={this.props.updateOpen}
                    handler={this.props.updateHandler}
                    onSubmit={this.handleUpdate}
                />
                <div className="item">
                    <div className="content">
                        <i className="ban red icon"></i>
                    </div>
                </div>
            </div>
        );
    }
});

var ClientDetails = React.createClass({
    componentDidMount: function() {
        $(React.findDOMNode(this.refs.modal)).modal({
            // transition: 'vertical flip',
            detachable: false,
            onHide: function() {
                this.props.handler();
            }.bind(this)
        });
    },
    componentDidUpdate: function() {
        if (this.props.open) {
            $(React.findDOMNode(this.refs.modal)).modal('show');
        }
    },
    render: function() {
        var data = this.props.data;
        return (
            <div className='clientDetails ui small modal' ref="modal">
                <div className="content">
                    <div className="description ui list">
                        <div className="item">Id: <strong>{data.client_id}</strong></div>
                        <div className="item">secret: <strong>{data.client_secret}</strong></div>
                        <div className="item">redirect url: <strong>{data.redirect_url}</strong></div>
                        <div className="item">grant types: <strong>{data.grant_types}</strong></div>
                        <div className="item">scope: <strong>{data.scope}</strong></div>
                    </div>
                </div>
                <div className="actions">
                    <div className="ui cancel button">Close</div>
                </div>
            </div>
        );
    }
});

var ClientUpdate = React.createClass({
    componentDidMount: function() {
        $(React.findDOMNode(this.refs.modal)).modal({
            // transition: 'vertical flip',
            detachable: false,
            onHide: function() {
                this.props.handler();
            }.bind(this)
        });
    },
    componentDidUpdate: function() {
        if (this.props.open) {
            $(React.findDOMNode(this.refs.modal)).modal('show');
        }
    },
    handleSubmit: function() {
        var client_id = React.findDOMNode(this.refs.client_id).value.trim();
        var client_secret = React.findDOMNode(this.refs.client_secret).value.trim();
        var redirect_url = React.findDOMNode(this.refs.redirect_url).value.trim();
        var grant_types = React.findDOMNode(this.refs.grant_types).value.trim();
        var scope = React.findDOMNode(this.refs.scope).value.trim();

        this.props.onSubmit({
            client_id: client_id,
            client_secret: client_secret,
            redirect_url: redirect_url,
            grant_types: grant_types,
            scope: scope
        });
        $(React.findDOMNode(this.refs.modal)).modal('hide');
    },
    render: function() {
        var data = this.props.data;
        return (
            <div className="clientForm ui small modal" ref="modal">
                <div className="header">
                    Update {this.props.data.client_id}
                </div>
                <div className="ui form content">
                    <div className="field">
                        <label>Client id</label>
                        <input type="text" defaultValue={data.client_id} ref="client_id" readOnly={true} />
                    </div>
                    <div className="field">
                        <label>Client secret</label>
                        <input type="text" defaultValue={data.client_secret} ref="client_secret" />
                    </div>
                    <div className="field">
                        <label>Redirect Url</label>
                        <input type="text" defaultValue={data.redirect_url} ref="redirect_url" />
                    </div>
                    <div className="field">
                        <label>Grant types</label>
                        <input type="text" defaultValue={data.grant_types} ref="grant_types" />
                    </div>
                    <div className="field">
                        <label>Scope</label>
                        <input type="text" defaultValue={data.scope} ref="scope" />
                    </div>
                </div>
                <div className="actions">
                    <button className="ui small primary button" onClick={this.handleSubmit}>Update</button>
                    <div className="ui cancel button">Cancel</div>
                </div>
            </div>
        );
    }
});


React.render(<ClientsCRUD url="/oauth2-admin/client"/>, document.getElementById('clientsContainer'));