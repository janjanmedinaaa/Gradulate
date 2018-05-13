import React, { Component } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, RefreshControl, StatusBar, TextInput, ListView, ScrollView, ToastAndroid, BackHandler } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { encrypt, decrypt } from 'react-native-simple-encryption';

var Realm = require('realm');

const decryptkey = 'JuAnAnToNiOmEdInAdEcRyPteD';
const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class Grades extends Component {
    static navigationOptions = {
        header: null,
    }

    constructor(props){
        super(props);
        realm = new Realm({schema: [
            {
                name: 'Subjects', 
                properties: {
                    ID: {type: 'int', default: 0}, 
                    SubjectCode: 'string', 
                    GradeComputation: 'string', 
                    Passing: 'int', 
                    Professor: 'string', 
                    Code: 'string' }
            },
            {
                name: 'GradeBook', 
                properties: {
                    ID: {type: 'int', default: 0}, 
                    SubjectCode: 'string', 
                    TestType: 'string', 
                    Score: 'int', 
                    TotalScore: 'int' }
            }
        ]})

        this.state = {
            dataSource: ds.cloneWithRows([]),
            showAddGrades: false,
            component: '',
            score: 0,
            totalscore: 0,
            passfailArray: [],
            gradeScoreArray: [],
            componentPercentHolderArray: [],
            componentPercentArray: [],
            refreshing: false,
        }
    }

    componentDidMount(){
        BackHandler.addEventListener('hardwareBackPress', () => {
            if(this.state.showAddGrades){
                this.setState({showAddGrades: false});
            }
            else{
                this.props.navigation.navigate('Subjects');
            }

            return true;
        });
        setTimeout(this.refreshItems, 30);
    }

    callrefresh = () => {
        setTimeout(this.refreshItems, 100);
    }

    refreshItems = () => {
        if(this.state.refreshing){
            this.setState({ refreshing: false,componentPercentArray: [] }, () => console.log(this.state));
        }

        this.setState({ componentPercentArray: [] }, () => console.log(this.state));

        let subjects = realm.objects('Subjects').filtered('ID=' + this.props.navigation.state.params.id);
        let parseSubjects = JSON.parse(JSON.stringify(subjects));
        let splitGradeComp = parseSubjects[0]['GradeComputation'].split('splitsplitsplit');
        let splitGradeComp1 = splitGradeComp[0].split('antoniojuanmedinagradulate');
        let splitGradeComp2 = splitGradeComp[1].split('antoniojuanmedinagradulate');

        var a = 0;
        while(a < splitGradeComp1.length){
            var componentGrade = parseFloat(this.getComponentGrade(this.props.navigation.state.params.id, splitGradeComp1[a])).toFixed(2);
            this.setState({ componentPercentArray: this.state.componentPercentArray.concat(componentGrade)}, () => console.log(this.state))
            a++;
        }

        this.setState({ dataSource: ds.cloneWithRows(splitGradeComp1)}, () => console.log(this.state));
    }

    passOrFail = () => {
        var getSubjects = JSON.parse(JSON.stringify(realm.objects('Subjects')));
        this.setState({ passfailArray: [], gradeScoreArray: [] }, () => console.log(this.state));

        for(var a = 0; a < Object.keys(getSubjects).length; a++){
            this.setState({ passfailArray: this.state.passfailArray.concat(this.setPassedOrFailed(getSubjects[a]['ID']))})
            this.setState({ gradeScoreArray: this.state.gradeScoreArray.concat(parseFloat(this.gradeStatus(getSubjects[a]['ID'])).toFixed(2))})
        }
    }
    
    addGrades = (componentChoice) => {
        this.setState({ component: componentChoice, showAddGrades: true}, () => console.log(this.state));
    }

    deleteGrades = (ID) => {
        realm.write(() => {
            var getItem = realm.objects('GradeBook').filtered('ID=' + ID);
            realm.delete(getItem);
        })

        this.refreshItems();
    }

    addGradestoDB = () => {
        let component = this.state.component;
        let score = parseInt(this.state.score, 10);
        let totalscore = parseInt(this.state.totalscore, 10);

        if(component == "" || component == null){
            ToastAndroid.show("Component can't be empty!", ToastAndroid.SHORT);
        }
        else if(totalscore < score){
            ToastAndroid.show("Score too high!", ToastAndroid.SHORT);
        }
        else if(score < 0) {
            ToastAndroid.show("Score too low!", ToastAndroid.SHORT);
        }
        else {
            realm.write(() => {
                var getLastGrade = realm.objects('GradeBook').max('ID');
                var ID =(getLastGrade == undefined) ? 1 : getLastGrade + 1;
                realm.create('GradeBook', {ID: ID, SubjectCode: this.props.navigation.state.params.id + "", TestType: component, Score: score, TotalScore: totalscore})
                this.refreshItems();
            })

            this.callrefresh();
            this.setState({ showAddGrades: false }, () => console.log(this.state));
            ToastAndroid.show('Grade Added!', ToastAndroid.SHORT);
        }
    }

    setPassedOrFailed = (id) => {
        var getPassing = JSON.parse(JSON.stringify(realm.objects('Subjects').filtered('ID=' + id)))
        if(this.gradeStatus(id) >= parseInt(getPassing[0]['Passing'], 10)){
            return "PASSED";
        }
        else{
            return "FAILED";
        }
    }

    gradeStatus = (id) => {
        let getSubject = realm.objects('Subjects').filtered('ID=' + id);
        let parseGetSubject = JSON.parse(JSON.stringify(getSubject));

        let getGradeComputation = parseGetSubject[0]['GradeComputation'].split('splitsplitsplit');
        let gradeComputationNames = getGradeComputation[0].split('antoniojuanmedinagradulate');
        let gradeComputationPercent = getGradeComputation[1].split('antoniojuanmedinagradulate');

        let computedGrade = 0; 
        let toStringID = id + "";
        for(var a = 0; a < gradeComputationPercent.length; a++){
            var sumScore = realm.objects('GradeBook').filtered('SubjectCode="' + toStringID + '" AND TestType="' + Component + '"').sum('Score');
            var sumTotalScore = realm.objects('GradeBook').filtered('SubjectCode="' + toStringID + '" AND TestType="' + Component + '"').sum('TotalScore');

            computedGrade += ( (sumTotalScore != 0) ? ((sumScore/sumTotalScore)*100) : 100) * (parseInt(gradeComputationPercent[a], 10) * 0.01)
        }

        return computedGrade;
    }

    getComponentGrade = (id, gradeComponent) => {
        let getSubject = realm.objects('Subjects').filtered('ID=' + id);
        let parseGetSubject = JSON.parse(JSON.stringify(getSubject));

        let getGradeComputation = parseGetSubject[0]['GradeComputation'].split('splitsplitsplit');
        let gradeComputationNames = getGradeComputation[0].split('antoniojuanmedinagradulate');
        let gradeComputationPercent = getGradeComputation[1].split('antoniojuanmedinagradulate');

        var Component = '';
        var Percent = '';
        var ComponentGrade = 0;
        for(var a = 0; a < gradeComputationNames.length; a++){
            if(gradeComponent == gradeComputationNames[a]){
                Component = gradeComputationNames[a];
                Percent = gradeComputationPercent[a];
            }
        }

        let toStringID = id + "";
        var sumScore = realm.objects('GradeBook').filtered('SubjectCode="' + toStringID + '" AND TestType="' + Component + '"').sum('Score');
        var sumTotalScore = realm.objects('GradeBook').filtered('SubjectCode="' + toStringID + '" AND TestType="' + Component + '"').sum('TotalScore');

        ComponentGrade = ( (sumTotalScore != 0) ? ((sumScore/sumTotalScore)*100) : 100) * (parseInt(Percent, 10) * 0.01)

        return ComponentGrade;
    }

    render(){
        return(
            <View style={{flex: 1, backgroundColor: '#fff'}}>
                <Animatable.View style={styles.container}>
                    <StatusBar backgroundColor="#8AD0F4" barStyle="light-content" />
                    <View style={styles.header}>
                        <Text style={styles.titletext}>{this.props.navigation.state.params.subjectCode}</Text>
                        <Text style={styles.subjectprof}>{this.props.navigation.state.params.professor}</Text>
                        <View style={styles.shadow} />
                    </View>
                    <ListView
                        enableEmptySections
                        style={styles.content}
                        dataSource={this.state.dataSource}
                        refreshControl={ <RefreshControl refreshing={this.state.refreshing} onRefresh={this.refreshItems.bind(this)} />}
                        renderRow={(rowData, sectionID, rowID) =>
                            <View style={styles.gradeitem}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={styles.gradetitle}>{rowData}</Text>
                                    <TouchableOpacity onPress={this.addGrades.bind(this, rowData)} style={{margin: 15, marginRight: 20}}><Text style={styles.addsign}>&#10010;</Text></TouchableOpacity>
                                </View>
                                <ListView
                                    enableEmptySections
                                    dataSource = {ds.cloneWithRows(JSON.parse(JSON.stringify(realm.objects('GradeBook').filtered('TestType="' + rowData + '" AND SubjectCode="' + this.props.navigation.state.params.id + '"').sorted('ID'))))}
                                    renderRow={(rowData, sectionID, rowID) => 
                                        <TouchableOpacity onLongPress={this.deleteGrades.bind(this, rowData.ID)}><Text style={styles.gradedetails}>#{parseInt(rowID, 10) + 1} = {rowData.Score}/{rowData.TotalScore}</Text></TouchableOpacity>
                                    }
                                />
                                <Text style={styles.gradepercent}>{this.state.componentPercentArray[rowID]}%</Text>
                            </View>
                        }
                    />
                    { this.state.showAddGrades ? <Animatable.View animation="bounceInUp" style={styles.addsubjectsview}>
                        <View style={{flexDirection: 'row'}}>
                            <TextInput style={styles.formtextviewcomponent} editable={false} placeholder="Component" onChangeText={(SubjectCode) => this.setState({SubjectCode}, () => console.log(this.state))} underlineColorAndroid="transparent">{this.state.component}</TextInput>
                            <Text style={styles.formtext}> = </Text>
                            <TextInput style={styles.formtextview} onChangeText={(score) => this.setState({score}, () => console.log(this.state))} underlineColorAndroid="transparent" keyboardType = 'numeric'/>
                            <Text style={styles.formtext}>/</Text>
                            <TextInput style={styles.formtextview} onChangeText={(totalscore) => this.setState({totalscore}, () => console.log(this.state))} underlineColorAndroid="transparent" keyboardType = 'numeric'/>
                        </View>
                        <TouchableOpacity onPress={this.addGradestoDB}>
                            <Text style={styles.submitbutton}>Add</Text>
                        </TouchableOpacity>
                    </Animatable.View> : null}
                </Animatable.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    addbutton:{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 80,
        height: 80,
        borderRadius: 80,
        backgroundColor: '#8AD0F4',
        margin: 15,
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addsign:{
        flex: 1,
        fontSize: 25,
        color: '#fff',
    },
    addsubjectsview:{
        flex: 1,
        position: 'absolute',
        width: WIDTH-80,
        backgroundColor: '#F2F3F3',
        padding: 15,
        borderRadius: 10,
    },
    formtextview: {
        flex: 1,
        fontSize: 13,
        color: '#8AD0F4',
        fontFamily:'monospace',
        fontWeight: 'bold',
        borderWidth: 2,
        borderRadius: 10,
        margin: 5,
        borderColor: '#8AD0F4',
        textAlign: 'center',
        height: 40
    },
    formtextviewcomponent: {
        flex: 4,
        fontSize: 13,
        color: '#8AD0F4',
        fontFamily:'monospace',
        fontWeight: 'bold',
        borderWidth: 2,
        borderRadius: 10,
        margin: 3,
        paddingLeft: 10,
        borderColor: '#8AD0F4',
        height: 40
    },
    submitbutton:{
        alignSelf: 'flex-end',
        fontSize: 17,
        color: '#8AD0F4',
        fontFamily:'monospace',
        fontWeight: 'bold',
        margin: 10,
    },
    formtext: {
        fontSize: 15,
        color: '#8AD0F4',
        fontFamily:'monospace',
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    addComponent:{
        fontSize: 15,
        color: '#8AD0F4',
        fontFamily:'monospace',
        fontWeight: 'bold',
        margin: 5,
        marginRight: 20,
        alignSelf: 'flex-end'
    },
    header:{
        height: 95,
        backgroundColor: '#8AD0F4',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 20,
    },
    shadow:{
        alignSelf: 'flex-end',
        width: WIDTH,
        height: 10,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'black',
        opacity: 0.1
    },
    content:{
        flex: 6.5,
        backgroundColor: '#fff',
    },
    titletext:{
        fontSize: 35,
        color: '#fff',
        fontFamily:'monospace',
        fontWeight: 'bold',
    },
    subjectprof: {
        fontSize: 17,
        color: '#fff',
        fontFamily:'monospace',
        marginTop: -10,
        marginBottom: 5
    },
    gradeitem:{
        alignSelf: 'center',
        margin: 20,
        marginTop: 0,
        width: WIDTH-50,
        backgroundColor: '#FA9AA1',
        borderRadius: 10,
        justifyContent: 'flex-end',
        elevation: 5,
    },
    shadowitem:{
        alignSelf: 'flex-end',
        width: WIDTH,
        height: 10,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: 'black',
        opacity: 0.1,
    },
    gradetitle:{
        fontSize: 26,
        color: '#fff',
        fontFamily:'monospace',
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        margin: 15,
        marginBottom: 0,
        flex: 7,
    },
    gradedetails:{
        fontSize: 20,
        color: '#fff',
        fontFamily:'monospace',
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        margin: 10,
        marginTop: -5,
        marginLeft: 50
    },
    gradepercent:{
        fontSize: 20,
        color: '#fff',
        fontFamily:'monospace',
        fontWeight: 'bold',
        alignSelf: 'flex-end',
        margin: 15,
        marginTop: 0,
        marginBottom: 15,
    },
});