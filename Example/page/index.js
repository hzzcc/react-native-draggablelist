import React , {Component} from 'react'
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
} from 'react-native';

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