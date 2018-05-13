import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, StatusBar, RefreshControl, FlatList, TextInput, Clipboard, Dimensions, ScrollView, ToastAndroid, ListView, BackHandler } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { encrypt, decrypt } from 'react-native-simple-encryption';
var Realm = require('realm');

const decryptkey = 'JuAnAnToNiOmEdInAdEcRyPteD';
const { width: WIDTH, height: HEIGHT } = Dimensions.get("window");
var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class Subjects extends Component {
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
            showAddSubjects: false,
            gradeComponentCounter: 3,
            SubjectCode: '',
            Professor: '',
            Passing: 0,
            GCOne: '',
            GCTwo: '',
            GCThree: '',
            GCFour: '',
            GCFive: '',
            GCSix: '',
            GCSeven: '',
            GCOnePercent: 0,
            GCTwoPercent: 0,
            GCThreePercent: 0,
            GCFourPercent: 0,
            GCFivePercent: 0,
            GCSixPercent: 0,
            GCSevenPercent: 0,
            passfailArray: [],
            gradeScoreArray: [],
            showAddCode: false,
            Code: '',
            refreshing: false
        }
    }

    componentDidMount(){
        BackHandler.addEventListener('hardwareBackPress', () => {
            if(this.state.showAddSubjects || this.state.showAddCode){
                this.setState({
                    gradeComponentCounter: 3,
                    SubjectCode: '',
                    Professor: '',
                    Passing: 0,
                    GCOne: '',
                    GCTwo: '',
                    GCThree: '',
                    GCFour: '',
                    GCFive: '',
                    GCSix: '',
                    GCSeven: '',
                    GCOnePercent: 0,
                    GCTwoPercent: 0,
                    GCThreePercent: 0,
                    GCFourPercent: 0,
                    GCFivePercent: 0,
                    GCSixPercent: 0,
                    GCSevenPercent: 0,
                    showAddSubjects: false,
                    showAddCode: false,
                    Code: ''
                }, () => console.log(this.state))
            }
            else{
                BackHandler.exitApp();
            }

            return true;
        });

        let subjects = realm.objects('Subjects');
        let parseSubjects = JSON.parse(JSON.stringify(subjects));
        this.setState({ dataSource: ds.cloneWithRows(parseSubjects)}, () => console.log(this.state));
        setTimeout(this.refreshItems, 30);
    }

    refreshItems = () => {
        if(this.state.refreshing){
            this.setState({ refresh: false});
        }
        let subjects = realm.objects('Subjects').sorted('ID');
        let parseSubjects = JSON.parse(JSON.stringify(subjects));
        this.setState({ dataSource: ds.cloneWithRows(parseSubjects)}, () => console.log(this.state));
        this.passOrFail();
    }

    passOrFail = () => {
        var getSubjects = JSON.parse(JSON.stringify(realm.objects('Subjects')));
        this.setState({ passfailArray: [], gradeScoreArray: [] }, console.log(this.state));
        
        for(var a = 0; a < Object.keys(getSubjects).length; a++){
            this.setState({ passfailArray: this.state.passfailArray.concat(this.setPassedOrFailed(getSubjects[a]['ID']))})
            this.setState({ gradeScoreArray: this.state.gradeScoreArray.concat(parseFloat(this.gradeStatus(getSubjects[a]['ID'])).toFixed(2))})
        }   
    }
    
    getGrades = (subjectCode, professor, id) => {
        this.props.navigation.navigate('Grades', {'subjectCode': subjectCode, 'professor': professor, 'id': id});
    }

    deleteSubject = (subjectCode, ID) => {
        Alert.alert(
            'Delete ' + subjectCode,
            'Are you sure you want to delete ' + subjectCode + '?',
            [
              {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
              {text: 'OK', onPress: () => {
                realm.write(() => {
                    var getItem = realm.objects('Subjects').filtered('ID=' + ID);
                    var getItem2 = realm.objects('GradeBook').filtered('SubjectCode="' + ID + '"');
                    realm.delete(getItem);
                    realm.delete(getItem2);
                })

                this.refreshItems();
              }},
            ],
          )
    }

    addGradeCode = () => {

        if(this.state.Code == "" || this.state.Code == undefined){
            ToastAndroid.show('Enter Code', ToastAndroid.SHORT);
        }
        else{
            var Code = decrypt(decryptkey, this.state.Code);
            var splitCode = Code.split('JuAnAnToNiOmEdInAcOdE');
            if(splitCode.length = 4){
                realm.write(() => {
                    var getLastSubject = realm.objects('Subjects').max('ID');
                    var IDSubjects = (getLastSubject == undefined) ? 1 : getLastSubject + 1;
        
                    var Status = "";
                    realm.create('Subjects', {ID: IDSubjects, SubjectCode: splitCode[0], GradeComputation: splitCode[1], Passing: parseInt(splitCode[2], 10), Professor: splitCode[3], Code: this.state.Code})
                })
        
                this.setState({ showAddCode: false, showAddSubjects: false }, console.log(this.state));
                ToastAndroid.show('Subject Added!', ToastAndroid.SHORT);
        
                this.refreshItems();
            }
            else{
                ToastAndroid.show("Invalid Code", ToastAndroid.SHORT);
            }
        }
        
    }

    addSubjects = () => {
        var one = (this.state.GCOnePercent > 0 && this.state.GCOnePercent != null && this.state.GCOnePercent != undefined) ? parseInt(this.state.GCOnePercent, 10) : 0;
        var two =  (this.state.GCTwoPercent > 0 && this.state.GCTwoPercent != null && this.state.GCTwoPercent != undefined) ? parseInt(this.state.GCTwoPercent, 10) : 0;
        var three = (this.state.GCThreePercent > 0 && this.state.GCThreePercent != null && this.state.GCThreePercent != undefined) ? parseInt(this.state.GCThreePercent, 10) : 0;
        var four = (this.state.GCFourPercent > 0 && this.state.GCFourPercent != null && this.state.GCFourPercent != undefined) ? parseInt(this.state.GCFourPercent, 10) : 0;
        var five = (this.state.GCFivePercent > 0 && this.state.GCFivePercent != null && this.state.GCFivePercent != undefined) ? parseInt(this.state.GCFivePercent, 10) : 0;
        var six = (this.state.GCSixPercent > 0 && this.state.GCSixPercent != null && this.state.GCSixPercent != undefined) ? parseInt(this.state.GCSixPercent, 10) : 0;
        var seven = (this.state.GCSevenPercent > 0 && this.state.GCSevenPercent != null && this.state.GCSevenPercent != undefined) ? parseInt(this.state.GCSevenPercent, 10) : 0;
        var Passing = (this.state.Passing > 0 && this.state.Passing != null && this.state.Passing != undefined) ? parseInt(this.state.Passing, 10) : 0;
        var GCTotal =  one + two + three + four + five + six + seven;

        var GC1 = "", GC2 = "";

        (this.state.GC0ne != "" && one != "" && one != null && one != undefined) ? 
            (GC1 += this.state.GCOne, GC2 += this.state.GCOnePercent)
            : null;

        (this.state.GCTwo != "" && two != "" && two != null && two != undefined) ? 
            (GC1 += "antoniojuanmedinagradulate" + this.state.GCTwo, GC2 += "antoniojuanmedinagradulate" + this.state.GCTwoPercent)
            : null;

        (this.state.GCThree != "" && three != "" && three && three != undefined) ? 
            (GC1 += "antoniojuanmedinagradulate" + this.state.GCThree, GC2 += "antoniojuanmedinagradulate" + this.state.GCThreePercent)
            : null;

        (this.state.GCFour != "" && four != "" && four != null && four != undefined) ? 
            (GC1 += "antoniojuanmedinagradulate" + this.state.GCFour, GC2 += "antoniojuanmedinagradulate" + this.state.GCFourPercent)
            : null;

        (this.state.GCFive != "" && five != "" && five != null && five != undefined) ? 
            (GC1 += "antoniojuanmedinagradulate" + this.state.GCFive,  GC2 += "antoniojuanmedinagradulate" + this.state.GCFivePercent)
            : null;

        (this.state.GCSix != "" && six != "" && six != null && six != undefined) ? 
            (GC1 += "antoniojuanmedinagradulate" + this.state.GCSix, GC2 += "antoniojuanmedinagradulate" + this.state.GCSixPercent)
            : null;

        (this.state.GCSeven != "" && seven != "" && seven != null && seven != undefined) ? 
            (GC1 += "antoniojuanmedinagradulate" + this.state.GCSeven, GC2 += "antoniojuanmedinagradulate" + this.state.GCSevenPercent)
            : null;
        
        var Code = encrypt(decryptkey, this.state.SubjectCode + "JuAnAnToNiOmEdInAcOdE" + GC1 + "splitsplitsplit" + GC2 + "JuAnAnToNiOmEdInAcOdE" + Passing + "JuAnAnToNiOmEdInAcOdE" + this.state.Professor);

        if(this.state.SubjectCode == "" || this.state.SubjectCode == null){
            ToastAndroid.show("Subject Code required.", ToastAndroid.SHORT);
        }
        else if(Passing > 100){
            ToastAndroid.show("Passing Percentage too high", ToastAndroid.SHORT);
        }
        else if(Passing <= 0 || Passing == undefined || Passing == null){
            ToastAndroid.show("Passing Percentage required", ToastAndroid.SHORT);
        }
        else if(this.state.Professor == "" || this.state.Professor == null){
            ToastAndroid.show("Professor required", ToastAndroid.SHORT);
        }
        else if(GC1 == "" || GC1 == null || GC1 == undefined){
            ToastAndroid.show("Atleast 1 pair of Component required.", ToastAndroid.SHORT);
        }
        else if(GC2 == "" || GC2 == null || GC2 == undefined){
            ToastAndroid.show("Atleast 1 pair of Component required.", ToastAndroid.SHORT);
        }
        else if(GCTotal < 100){
            ToastAndroid.show("Grade Percentage too low.", ToastAndroid.SHORT);
        }
        else if(GCTotal > 100){
            ToastAndroid.show("Grade Percentage too high.", ToastAndroid.SHORT);
        }
        else if (GCTotal == 100){
            realm.write(() => {
                var getLastSubject = realm.objects('Subjects').max('ID');
                var IDSubjects = (getLastSubject == undefined) ? 1 : getLastSubject + 1;

                var Status = "";
                realm.create('Subjects', {ID: IDSubjects, SubjectCode: this.state.SubjectCode, GradeComputation: GC1 + "splitsplitsplit" + GC2, Passing: Passing, Professor: this.state.Professor, Code: Code})
            })
            this.setState({ showAddSubjects: false, showAddCode: false }, console.log(this.state));
            ToastAndroid.show('Subject Added!', ToastAndroid.SHORT);

            this.refreshItems();
            this.setState({
                gradeComponentCounter: 3,
                SubjectCode: '',
                Professor: '',
                Passing: 0,
                GCOne: '',
                GCTwo: '',
                GCThree: '',
                GCFour: '',
                GCFive: '',
                GCSix: '',
                GCSeven: '',
                GCOnePercent: 0,
                GCTwoPercent: 0,
                GCThreePercent: 0,
                GCFourPercent: 0,
                GCFivePercent: 0,
                GCSixPercent: 0,
                GCSevenPercent: 0,
                showAddCode: false,
                Code: ''
            }, () => console.log(this.state))
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
            var sumScore = realm.objects('GradeBook').filtered('SubjectCode="' + toStringID + '" AND TestType="' + gradeComputationNames[a] + '"').sum('Score');
            var sumTotalScore = realm.objects('GradeBook').filtered('SubjectCode="' + toStringID + '" AND TestType="' + gradeComputationNames[a] + '"').sum('TotalScore');

            computedGrade += ( (sumTotalScore != 0) ? ((sumScore/sumTotalScore)*100) : 100) * (parseInt(gradeComputationPercent[a], 10) * 0.01)
        }

        return computedGrade;
    }

    writeToClipboard = async (Code) => {
        await Clipboard.setString(Code);
        ToastAndroid.show('Copied to Clipboard!', ToastAndroid.SHORT);
    };

    render(){
        return(
            <Animatable.View animation="fadeIn" duration={500} style={styles.container}>
                <StatusBar backgroundColor="#7FEEC7" barStyle="light-content" />
                <View style={styles.header}>
                    <Text style={styles.titletext}>SUBJECTS</Text>
                    <View style={styles.shadow} />
                </View>
                <ListView
                    enableEmptySections
                    style={styles.content}
                    dataSource={this.state.dataSource}
                    refreshControl={ <RefreshControl refreshing={this.state.refreshing} onRefresh={this.refreshItems.bind(this)} />}
                    renderRow={(rowData, sectionID, rowID) =>
                        <TouchableOpacity onPress={this.getGrades.bind(this, rowData.SubjectCode, rowData.Professor, rowData.ID)} onLongPress={this.deleteSubject.bind(this, rowData.SubjectCode, rowData.ID)}>
                            <View style={styles.subjectitem}>
                                <Text style={styles.subjectpassfail}>{this.state.gradeScoreArray[rowID]} - {this.state.passfailArray[rowID]}</Text>
                                <Text style={styles.subjecttitle}>{rowData.SubjectCode}</Text>
                                <View style={{flexDirection: 'row'}}>
                                    <Text style={styles.subjectprof}>{rowData.Professor}</Text>
                                    <TouchableOpacity style={{flex: 1, marginRight: 15}} onPress={this.writeToClipboard.bind(this, rowData.Code)}><Text style={styles.exportbutton}>EXPORT</Text></TouchableOpacity>
                                </View>
                            </View>
                            
                        </TouchableOpacity>
                    }
                />
                <TouchableOpacity style={styles.addbutton} onPress={() => this.setState({ showAddSubjects: true })} onLongPress={() => this.setState({ showAddCode: true })}>
                    <Text style={styles.addsign}>&#10010;</Text>
                </TouchableOpacity>

                { this.state.showAddSubjects ? <Animatable.View animation="bounceInUp" style={styles.addsubjectsview}>
                    <View style={{flexDirection: 'row'}}>
                        <TextInput style={styles.formtextviewsubjectcode} placeholder="Subject Code" onChangeText={(SubjectCode) => this.setState({SubjectCode})} underlineColorAndroid="transparent"/>
                        <TextInput style={styles.formtextviewpassing} placeholder="%" onChangeText={(Passing) => this.setState({Passing}, () => console.log(this.state))} keyboardType = 'numeric' underlineColorAndroid="transparent"/>
                    </View>
                    <TextInput style={styles.formtextview} placeholder="Professor" onChangeText={(Professor) => this.setState({Professor}, () => console.log(this.state))} underlineColorAndroid="transparent"/>
                    <View style={{flexDirection: 'row', flex: 1}}>
                        <Text style={styles.formtext}>Grade Components</Text> 
                        <TouchableOpacity onPress={() => this.setState({ gradeComponentCounter: this.state.gradeComponentCounter+1})}>
                            <Text style={styles.addComponent}>&#10010;</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <TextInput style={styles.formtextviewsubjectcode} placeholder="Component" onChangeText={(GCOne) => this.setState({GCOne}, () => console.log(this.state))} underlineColorAndroid="transparent"/>
                        <TextInput style={styles.formtextviewpassing} placeholder="%" onChangeText={(GCOnePercent) => this.setState({GCOnePercent}, () => console.log(this.state))} keyboardType = 'numeric' underlineColorAndroid="transparent"/>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <TextInput style={styles.formtextviewsubjectcode} placeholder="Component" onChangeText={(GCTwo) => this.setState({GCTwo}, () => console.log(this.state))} underlineColorAndroid="transparent"/>
                        <TextInput style={styles.formtextviewpassing} placeholder="%" onChangeText={(GCTwoPercent) => this.setState({GCTwoPercent}, () => console.log(this.state))} keyboardType = 'numeric' underlineColorAndroid="transparent"/>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <TextInput style={styles.formtextviewsubjectcode} placeholder="Component" onChangeText={(GCThree) => this.setState({GCThree}, () => console.log(this.state))} underlineColorAndroid="transparent"/>
                        <TextInput style={styles.formtextviewpassing} placeholder="%" onChangeText={(GCThreePercent) => this.setState({GCThreePercent}, () => console.log(this.state))} keyboardType = 'numeric' underlineColorAndroid="transparent"/>
                    </View>
                    { (this.state.gradeComponentCounter >= 4) ? <View style={{flexDirection: 'row'}}>
                        <TextInput style={styles.formtextviewsubjectcode} placeholder="Component" onChangeText={(GCFour) => this.setState({GCFour}, () => console.log(this.state))} underlineColorAndroid="transparent"/>
                        <TextInput style={styles.formtextviewpassing} placeholder="%" onChangeText={(GCFourPercent) => this.setState({GCFourPercent}, () => console.log(this.state))} keyboardType = 'numeric' underlineColorAndroid="transparent"/>
                    </View> : null }
                    { (this.state.gradeComponentCounter >= 5) ? <View style={{flexDirection: 'row'}}>
                        <TextInput style={styles.formtextviewsubjectcode} placeholder="Component" onChangeText={(GCFive) => this.setState({GCFive}, () => console.log(this.state))} underlineColorAndroid="transparent"/>
                        <TextInput style={styles.formtextviewpassing} placeholder="%" onChangeText={(GCFivePercent) => this.setState({GCFivePercent}, () => console.log(this.state))} keyboardType = 'numeric' underlineColorAndroid="transparent"/>
                    </View> : null }
                    { (this.state.gradeComponentCounter >= 6) ? <View style={{flexDirection: 'row'}}>
                        <TextInput style={styles.formtextviewsubjectcode} placeholder="Component" onChangeText={(GCSix) => this.setState({GCSix}, () => console.log(this.state))} underlineColorAndroid="transparent"/>
                        <TextInput style={styles.formtextviewpassing} placeholder="%" onChangeText={(GCSixPercent) => this.setState({GCSixPercent}, () => console.log(this.state))} keyboardType = 'numeric' underlineColorAndroid="transparent"/>
                    </View> : null }
                    { (this.state.gradeComponentCounter >= 7) ? <View style={{flexDirection: 'row'}}>
                        <TextInput style={styles.formtextviewsubjectcode} placeholder="Component" onChangeText={(GCSeven) => this.setState({GCSeven}, () => console.log(this.state))} underlineColorAndroid="transparent"/>
                        <TextInput style={styles.formtextviewpassing} placeholder="%" onChangeText={(GCSevenPercent) => this.setState({GCSixPercent}, () => console.log(this.state))} keyboardType = 'numeric' underlineColorAndroid="transparent"/>
                    </View> : null }
                    <TouchableOpacity onPress={this.addSubjects}>
                        <Text style={styles.submitbutton}>Add</Text>
                    </TouchableOpacity>
                </Animatable.View> : null}
                { this.state.showAddCode ? <Animatable.View animation="bounceInUp" style={styles.addsubjectsview}>
                    <Text style={styles.formtext}>Import Grade Code</Text>
                    <TextInput style={styles.formtextview} placeholder="Code" onChangeText={(Code) => this.setState({Code}, () => console.log(this.state))} underlineColorAndroid="transparent"/>
                    <TouchableOpacity onPress={this.addGradeCode}>
                        <Text style={styles.submitbutton}>Add</Text>
                    </TouchableOpacity>
                </Animatable.View> : null}
            </Animatable.View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addbutton:{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 70,
        height: 70,
        borderRadius: 70,
        backgroundColor: '#7FEEC7',
        margin: 15,
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10
    },
    addsign:{
        fontSize: 25,
        color: '#fff'
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
        margin: 3,
        paddingLeft: 10,
        borderColor: '#8AD0F4',
        height: 40
    },
    formtextviewsubjectcode: {
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
    formtextviewpassing: {
        flex: 1,
        fontSize: 13,
        color: '#8AD0F4',
        fontFamily:'monospace',
        fontWeight: 'bold',
        borderWidth: 2,
        borderRadius: 10,
        margin: 3,
        textAlign: 'center',
        borderColor: '#8AD0F4',
        textAlign: 'center',
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
        flex: 1,
        fontSize: 15,
        color: '#8AD0F4',
        fontFamily:'monospace',
        fontWeight: 'bold',
        margin: 5,
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
        backgroundColor: '#7FEEC7',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 20,
    },
    shadow:{
        alignSelf: 'flex-end',
        width: WIDTH,
        height: 7,
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
        paddingBottom: 20,
    },
    titletext:{
        fontSize: 40,
        color: '#fff',
        fontFamily:'monospace',
        fontWeight: 'bold',
    },
    subjectitem:{
        flex: 1,
        alignSelf: 'center',
        margin: 20,
        marginTop: 0,
        width: WIDTH-50,
        height: 140,
        backgroundColor: '#8AD0F4',
        borderRadius: 10,
        justifyContent: 'flex-end',
        elevation: 5
    },
    shadowitem:{
        alignSelf: 'flex-end',
        width: WIDTH,
        height: 7,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: 'black',
        opacity: 0.1,
    },
    subjecttitle:{
        fontSize: 26,
        color: '#fff',
        fontFamily:'monospace',
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginLeft: 15,
    },
    subjectprof:{
        flex: 1,
        fontSize: 20,
        color: '#fff',
        fontFamily:'monospace',
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginLeft: 15,
        marginTop: -5,
        marginBottom: 15,
    },
    subjectpassfail:{
        position: 'absolute',
        fontSize: 20,
        color: '#fff',
        top: 0,
        right: 0,
        fontFamily:'monospace',
        fontWeight: 'bold',
        alignSelf: 'flex-end',
        marginRight: 15,
        marginTop: 15
    },
    exportbutton:{
        flex: 1,
        position: 'absolute',
        fontSize: 20,
        color: '#fff',
        fontFamily:'monospace',
        fontWeight: 'bold',
        alignSelf: 'flex-end'
    }
})