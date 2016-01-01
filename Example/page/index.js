'use strict';

var React = require('react-native');
var {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    } = React;

var DraggableList = require('react-native-draggablelist');

var Cell = require('./cell');

var Data = [];
for(var i = 0; i< 20; i++){
    Data[i] = {
        id: i,
        name: 'cell_' + i,
    }
}

var Page = React.createClass({
    render: function() {
        return (
            <DraggableList
                component={Cell}
                dataSource={Data}
                />
        );
    }
});

module.exports = Page;