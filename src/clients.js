/**
 * Hierarchy
 *
 * -ClientsCRUD
 *   -SearchBar
 *   -ClientList
 *     -Client
 *       -ClientActions
 *          -ClientUpdate
 *          -ClientDelete
 *       -ClientDetails (Modal)
 */

var ClientsCRUD = React.createClass({
    getInitialState: function() {
        return {
            clients: [],
            filterText: '',
            openNewClientForm: false
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
            }
        });
    },
    handleNew: function(data) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'post',
            data: {'client': data},
            success: function() {
                this.loadClients();
            }.bind(this),
            error: function(xhr, status, error) {
                console.log(xhr, status, error);
            }
        });
    },
    handleUpdate: function(data) {
        $.ajax({
            url: this.props.url + '/' + data.client_id,
            dataType: 'json',
            type: 'patch',
            data: {'client': data},
            success: function() {
                this.loadClients();
            }.bind(this),
            error: function(xhr, status, error) {
                console.log(xhr, status, error);
            }
        });
    },
    handleDelete: function(client_id) {
        $.ajax({
            url: this.props.url + '/' + client_id,
            dataType: 'json',
            type: 'delete',
            success: function() {
                this.loadClients();
            }.bind(this),
            error: function(xhr, status, error) {
                console.log(xhr, status, error);
            }
        });
    },
    toggleNewClientForm: function() {
        this.setState({openNewClientForm: !this.state.openNewClientForm});
    },
    render: function() {
        var controllsStyle = {
            padding: 0,
            margin: 0
        };
        var newClientData = {
            client_id: '',
            client_secret: '',
            grant_types: 'password'
        };
        return (
            <div className="clientsCRUD">
                <ClientNew
                    data={newClientData}
                    open={this.state.openNewClientForm}
                    handler={this.toggleNewClientForm}
                    onSubmit={this.handleNew}
                />
                <SearchBar filterText={this.state.filterText} onUserInput={this.handleUserInput} />
                <ClientList
                    clients={this.state.clients}
                    filterText={this.state.filterText}
                    onUpdate={this.handleUpdate}
                    onDelete={this.handleDelete}
                    url={this.props.url}
                />
                <button className="ui right primary button" onClick={this.toggleNewClientForm}>Create</button>
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
            items.push(<Client
                key={client.client_id}
                data={client}
                onUpdate={this.props.onUpdate}
                onDelete={this.props.onDelete}
                url={this.props.url}
            />);
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
            updateOpen: false,
            deleteOpen: false
        };
    },
    toggleDetails: function() {
        this.setState({detailsOpen: !this.state.detailsOpen});
    },
    toggleUpdate: function() {
        this.setState({updateOpen: !this.state.updateOpen});
    },
    toggleDelete: function() {
        this.setState({deleteOpen: !this.state.deleteOpen});
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
                        deleteOpen={this.state.deleteOpen}
                        deleteHandler={this.toggleDelete}
                        onDelete={this.props.onDelete}
                    />
                </div>
                <div className="content" onClick={this.toggleDetails}>
                    <i className="spy icon"></i>
                    <span>{data.client_id}</span>
                </div>
                <ClientDetails
                    data={data}
                    open={this.state.detailsOpen}
                    handler={this.toggleDetails}
                    url={this.props.url}
                />
            </div>
        );
    }
});

var ClientActions = React.createClass({
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
                    onSubmit={this.props.onUpdate}
                />
                <div className="item" onClick={this.props.deleteHandler}>
                    <div className="content">
                        <i className="ban red icon"></i>
                    </div>
                </div>
                <ClientDelete
                    data={this.props.data}
                    open={this.props.deleteOpen}
                    handler={this.props.deleteHandler}
                    onSubmit={this.props.onDelete}
                />
            </div>
        );
    }
});

var ClientDetails = React.createClass({
    componentDidMount: function() {
        $(React.findDOMNode(this.refs.modal)).modal({
            // transition: 'vertical flip',
            autofocus: true,
            // closable: false,
            duration: 100,
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
            <div className='clientDetails ui modal' ref="modal">
                <div className="header">
                    <h3>Client details</h3>
                </div>
                <div className="content">
                    <div className="ui grid">
                        <div className="four wide column ui list">
                            <div className="item">Id: <strong>{data.client_id}</strong></div>
                            <div className="item">secret: <strong>{data.client_secret}</strong></div>
                            <div className="item">redirect uri: <strong>{data.redirect_uri}</strong></div>
                            <div className="item">grant types: <strong>{data.grant_types}</strong></div>
                            <div className="item">scope: <strong>{data.scope}</strong></div>
                        </div>
                        <div className="twelve wide column">
                            <TokenCRUD client_id={data.client_id} url={this.props.url}/>
                        </div>
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
    render: function() {
        return (
            <ClientForm
                data={this.props.data}
                onSubmit={this.props.onSubmit}
                open={this.props.open}
                handler={this.props.handler}
            />
        );
    }
});

var ClientNew = React.createClass({
    render: function() {
        return (
            <ClientForm
                data={this.props.data}
                onSubmit={this.props.onSubmit}
                open={this.props.open}
                handler={this.props.handler}
            />
        );
    }
});

var ClientForm = React.createClass({
    componentDidMount: function() {
        $(React.findDOMNode(this.refs.modal)).modal({
            autofocus: true,
            closable: false,
            duration: 100,
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
        var redirect_uri = React.findDOMNode(this.refs.redirect_uri).value.trim();
        var grant_types = React.findDOMNode(this.refs.grant_types).value.trim();
        var scope = React.findDOMNode(this.refs.scope).value.trim();

        this.props.onSubmit({
            client_id: client_id,
            client_secret: client_secret,
            redirect_uri: redirect_uri,
            grant_types: grant_types,
            scope: scope
        });
        $(React.findDOMNode(this.refs.modal)).modal('hide');
    },
    render: function() {
        var data = this.props.data;
        var isNew = !data.client_id;
        var submitActionName = isNew ? 'Create' : 'Update';
        return (
            <div className="clientForm ui small modal" ref="modal">
                <div className="header">
                    Update {data.client_id}
                </div>
                <div className="ui form content">
                    <div className="field">
                        <label>Client id</label>
                        <input type="text" defaultValue={data.client_id} ref="client_id" readOnly={!isNew} />
                    </div>
                    <div className="field">
                        <label>Client secret</label>
                        <input type="text" defaultValue={data.client_secret} ref="client_secret" />
                    </div>
                    <div className="field">
                        <label>Redirect Uri</label>
                        <input type="text" defaultValue={data.redirect_uri} ref="redirect_uri" />
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
                    <input type="submit" value={submitActionName} className="ui small primary button" onClick={this.handleSubmit} />
                    <div className="ui cancel button">Cancel</div>
                </div>
            </div>
        );
    }
});

var ClientDelete = React.createClass({
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
        this.props.onSubmit(this.props.data.client_id);
    },
    render: function() {
        var data = this.props.data;
        return (
            <div className='clientDelete ui small basic modal' ref="modal">
                <div className="ui icon header">
                    <i className="archive icon"></i>
                    Delete this client
                </div>
                <div className="content">
                    <p>Are you sure that you want to delete {data.client_id}?</p>
                </div>
                <div className="actions">
                    <div className="ui red basic cancel inverted button">
                        <i className="remove icon"></i>
                        No
                    </div>
                    <div className="ui green ok inverted button" onClick={this.handleSubmit}>
                        <i className="checkmark icon"></i>
                        Yes
                    </div>
                </div>
            </div>
        );
    }
});

var TokenCRUD = React.createClass({
    getInitialState: function() {
        return {tokens: []};
    },
    componentDidMount: function() {
        this.loadTokens();
    },
    loadTokens: function() {
        $.ajax({
            url: this.props.url + '/' + this.props.client_id + '/tokens',
            dataType: 'json',
            type: 'get',
            success: function(data) {
                this.setState({tokens: data});
            }.bind(this),
            error: function(xhr, status, error) {
                console.log(xhr, status, error);
            }
        });
    },
    handleDelete: function(access_token) {
        $.ajax({
            url: this.props.url + '/tokens/' + access_token,
            dataType: 'json',
            type: 'delete',
            success: function() {
                this.loadTokens();
            }.bind(this),
            error: function(xhr, status, error) {
                console.log(xhr, status, error);
            }
        });
    },
    handleAdd: function() {
        $.ajax({
            url: this.props.url + '/' + this.props.client_id + '/tokens',
            dataType: 'json',
            type: 'post',
            success: function(data) {
                this.loadTokens();
            }.bind(this),
            error: function(xhr, status, error) {
                console.log(xhr, status, error);
            }
        });
    },
    render: function() {
        return (
            <div className="tokenCRUD">
                <div className="header">
                    Tokens:
                </div>
                <TokenList tokens={this.state.tokens} onDelete={this.handleDelete} onAdd={this.handleAdd}/>
            </div>
        );
    }
});

var TokenList = React.createClass({
    render: function() {
        var items = [];
        this.props.tokens.forEach(function(token) {
            items.push(<Token data={token} onDelete={this.props.onDelete} key={token.access_token}/>);
        }.bind(this));
        return (
            <table className="ui very basic celled compact single line table">
                <thead>
                    <tr>
                        <th>access token</th>
                        <th>user id</th>
                        <th>expires</th>
                        <th>scope</th>
                        <th>action</th>
                    </tr>
                </thead>
                <tbody>
                    {items}
                </tbody>
                <tfoot>
                    <tr className="tokenForm">
                        <td colSpan="5">
                            <div className="ui small green button" onClick={this.props.onAdd}>Add</div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        );
    }
});

var Token = React.createClass({
    handleDelete: function() {
        if (confirm('Are you sure you want to delete this token?')) {
            this.props.onDelete(this.props.data.access_token);
        }
    },
    render: function() {
        return (
            <tr className="token">
                <td>{this.props.data.access_token}</td>
                <td>{this.props.data.user_id}</td>
                <td>{this.props.data.expires}</td>
                <td>{this.props.data.scope}</td>
                <td><i className="ban red icon" onClick={this.handleDelete}></i></td>
            </tr>
        );
    }
});


React.render(<ClientsCRUD url="/oauth2-admin/clients"/>, document.getElementById('clientsContainer'));