## react native dragableList

###How do I use it?
    
####Installation
    npm install react-native-dragablelist
   
####Use in your code

    var DragableList = require('react-native-dragablelist');

    <DragableList
            dataSource={this.state.dataSource}
            component={Cell}
            cellProps={{cancelPan: this.cancelPan, navigator: this.props.navigator}}
            onMove={this._onMove}
            keys={this.state.keys}
            shouldUpdateId={'2'}
            onPressCell={this.onPressCell}
            scrollStyle: {/*styles*/}, //scroll view style
            contentInset: {}, //scroll view contentInset
            />
            
    dataSource: isRequired, array of your data include id, like [{id: '1', name: ''}, {id: '2', name: ''}]
    component: isRequired, your cell component
    onMove: callback function, return the orders of cell by id
    keys: you can also pass data orders, like ['2','1'], but it should be same with your data ids
    shouldUpdateId: the cell should be update
    onPressCell: when cell pressed

####Attention 
    
    In your cell component, you should add below to your view 
     
     <View>
        {/* other views*/}
        <View {...this.props.dragHandlers} >
            {/* this is the rect you can drag*/}
        </View>
        {/* other views*/}
     </View>
            

