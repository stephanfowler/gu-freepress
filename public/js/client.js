
var Items = React.createClass({
    getInitialState: function () {
        return {
            relatedItems: this.props.relatedItems,
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

    drop: function (event) {        
        var self = this,
            childUrl = event.dataTransfer.getData("text");

        event.preventDefault();

        $.ajax({
            type: "POST",
            url: '/api/add',
            dataType: 'json',
            data: {
                parentUrl: self.props.parentUrl,
                childUrl: childUrl
            },
        }).done(function (result) {
            self.setState({
                relatedItems: result.items
            });
        });

        this.setState({
            isUnderDrag: false
        })
    },

    render: function () {
        return (
            <div id='items-container' onDrop={this.drop} onDragOver={this.dragOver} onDragLeave={this.dragLeave} className={this.state.isUnderDrag ? 'under-drag' : ''}>
                {this.state.relatedItems.map(function(item, index) {
                    return <div key={index} className="item">
                        <img src={item.image_url} />
                        <a href={item.url}>{item.title}</a>
                    </div>
                })}
            </div>
        );
    }
})

React.render(
    <Items parentUrl={FREEP.parentUrl} relatedItems={FREEP.relatedItems}/>,
    document.getElementById('app-container')
);
