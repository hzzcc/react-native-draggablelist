import React , {Component} from 'react'
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    PixelRatio,
} from 'react-native';

var Cell = React.createClass({
    render: function() {
        return (
            <View style={styles.container}>
                <Text style={styles.nameLabel}>
                    {this.props.rowData.name}
                </Text>
                <View style={styles.dragView} {...this.props.dragHandlers}/>
            </View>
        );
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1/PixelRatio.get(),
        borderColor: '#666',
        backgroundColor: '#fff',
    },
    nameLabel: {
        flex: 1,
    },
    dragView: {
        width: 40,
        height: 40,
        backgroundColor: 'red'
    },
});

module.exports = Cell;