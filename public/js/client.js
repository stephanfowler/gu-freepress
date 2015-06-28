
var Items = React.createClass({
    getInitialState: function () {
        return {
            items: this.props.items,
            isUnderDrag: false
        }
    },

    dragOver: function (event) {
        event.preventDefault();
        this.setState({
            isUnderDrag: true
        })
    },

    dragLeave: function (event) {
        event.preventDefault();
        this.setState({
            isUnderDrag: false
        })
    },

    api: function (apiAction, data, refresh) {
        var self = this;

        $.ajax({
            type: "POST",
            url: '/api/' + apiAction,
            dataType: 'json',
            data: data
        }).done(function (result, statusTxt, xhr) {
            if (refresh && xhr.status === 200 && result && result.items) {
                self.setState({
                    items: result.items
                });
            }
        }).fail(function (result) {
            console.log(result && result.message);
        });
    },

    drop: function (event) {
        var self = this,
            childUrl = event.dataTransfer.getData("text");

        event.preventDefault();

        if (childUrl) {
            this.api('add', {
                parentUrl: self.props.parentUrl,
                childUrl: childUrl
            }, true);
        }

        this.setState({
            isUnderDrag: false
        })
    },

    like: function (url, topic) {
        var self = this;

        this.api('like', {
            url: url,
            topic: topic
        });
    },

    render: function () {
        var self = this,
            items = this.state.items;

        return (
            <div id='items-container' onDrop={this.drop} onDragOver={this.dragOver} onDragLeave={this.dragLeave} className={this.state.isUnderDrag ? 'under-drag' : ''}>
                {items.length ?
                    items.map(function(item) {
                        return <Item item={item} like={self.like} isSelf={item.url === self.props.parentUrl}/>
                    })
                    :
                    <div className='when-empty'></div>
                }
                <div className='instructions'>Drop articles here from other news sites, rate the best ones.</div>
            </div>
        );
    }
})

Item = React.createClass({
    handleClick: function (event) {
        event.preventDefault();
        this.props.item.likes += 1;
        this.forceUpdate();
        this.props.like(this.props.item.url, this.props.item.topic);
    },

    render: function () {
        return <a 
                    key={this.props.item.url} 
                    className={'item' + (this.props.isSelf ? ' is-self' : '')}
                    href={this.props.item.url}
                    target='_top'>
            <div className='siteName'>{this.props.item.site_name}</div>
            <div className='image' style={{'backgroundImage': 'url(' + this.props.item.image_url + ')'}}></div>
            <div className='title'>{this.props.item.title}</div>
            <div className='likes'onClick={this.handleClick}>
                <span className="number">{this.props.item.likes || ''}</span>
            </div>
        </a>
    }
});

React.render(
    <Items parentUrl={INITIAL.parentUrl} items={INITIAL.items}/>,
    document.getElementById('app-container')
);
