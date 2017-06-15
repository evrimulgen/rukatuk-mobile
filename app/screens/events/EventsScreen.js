import React, { Component } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Text,
  View
} from 'react-native';
import Moment from 'moment';

import appStyles, { theme, navigatorStyle } from '../../config/styles';

export default class EventsScreen extends Component {
  static navigatorStyle = navigatorStyle

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      refreshing: false,
      isError: false,
      upcomingEvents: [],
      pastEvents: []
    };
  }

  componentDidMount() {
    this.fetchEvents();
  };

  _onRefresh(self) {
    self.setState({ refreshing: true });

    self.fetchEvents();
  }

  fetchEvents() {
    this.setState({ loading: true });

    this.props.fetchEvents.fetchLocalEvents()
      .then(events => this.updateEvents(events))
      .then(() => this.props.fetchEvents.fetchRemoteEvents())
      .then(events => this.updateEvents(events))
      .catch(err => {
        console.log(err);
        this.setState({
          loading: false,
          refreshing: false,
          isError: true
        });
      })
      .done();
  }

  updateEvents(events) {
    events.sort(this.compareEvents);

    let upcomingEvents = [];
    let pastEvents = [];
    let now = new Date();
    for (let e of events) {
      let startDate = new Date(e.startDate);
      if (startDate > now) {
        upcomingEvents.push(e);
      } else {
        pastEvents.push(e);
      }
    }

    this.setState({
      loading: false,
      refreshing: false,
      isError: false,
      upcomingEvents: upcomingEvents,
      pastEvents: pastEvents
    });
  }

  compareEvents(e1, e2) {
    if (e1.startDate === e2.startDate) {
      return 0;
    }

    return e1.startDate > e2.startDate ? -1 : 1;
  }

  render() {
    let hasEvents = this.state.upcomingEvents.length > 0 ||
                    this.state.pastEvents.length > 0;
    if (!hasEvents && this.state.loading) {
      return (
        <View style={[{alignItems: 'center', justifyContent: 'center'}, appStyles.container]}>
          <ActivityIndicator animating={true} size='large' />
        </View>
      );
    }

    return (
        <ScrollView
          style={appStyles.container}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this._onRefresh(this)} />
          }>
          {!hasEvents && this.state.isError && this.renderErrorCard()}

          {hasEvents && this.renderEvents()}
        </ScrollView>
    );
  }

  renderEvents() {
    return (
      <View>
        <View>
          {this.state.upcomingEvents.map((event) => this.renderUpcomingEvent(event))}
        </View>

        <Text style={{
            color: theme.colours.light,
            fontSize: 18,
            margin: 16,
            marginBottom: 4
        }}>
          Past Events
        </Text>

        <FlatList
          data={this.state.pastEvents}
          renderItem={this.renderPastEvent}
          keyExtractor={(event) => event.id}
          horizontal={true} />
      </View>
    );
  }

  renderUpcomingEvent(event) {
    return (
      <View key={event.id} style={appStyles.card}>
        <Image
          source={{ uri: event.imageUrl }}
          resizeMode='cover'
          style = {{
            flex: 1,
            height: 210,
            width: undefined
          }} >
        </Image>
        <View style={{ padding: 10 }}>
          <Text style={{
            color: theme.colours.light,
            fontSize: 18,
            fontWeight: 'bold'
          }}>
            {event.name}
          </Text>
          <Text style={{
            color: '#666666',
            paddingTop: 3
          }}>{event.venue.name}</Text>
          <Text style={{
            color: '#666666',
            paddingTop: 1
          }}>{Moment(event.startDate).format('ddd, D MMM @HH:mm')}</Text>
        </View>
      </View>
    );
  }

  renderPastEvent(item) {
    let event = item.item;
    return (
      <View
        key={event.id}
        style={[
          appStyles.card,
          {
            height: 180,
            width: 120
          }]}>
        <Image
          source={{ uri: event.imageUrl }}
          resizeMode='cover'
          style={{
            flex: 1,
            height: 90,
            width: undefined
          }} >
        </Image>
        <View style={{
          padding: 6,
          paddingTop: 10
        }}>
          <Text
            ellipsizeMode={'tail'}
            numberOfLines={1}
            style={{
              color: theme.colours.light,
              fontSize: 15,
              fontWeight: 'bold'
            }}>
            {event.name}
          </Text>
          <Text
            ellipsizeMode={'tail'}
            numberOfLines={1}
            style={{
              color: '#666666',
              paddingTop: 3,
              fontSize: 13
            }}>{event.venue.name}</Text>
          <Text
            ellipsizeMode={'tail'}
            numberOfLines={1}
            style={{
              color: '#666666',
              paddingTop: 1,
              fontSize: 13
            }}>{Moment(event.startDate).format('D MMM YYYY')}</Text>
        </View>
      </View>
    );
  }

  renderErrorCard() {
    return (
      <View style={[{
        height: 80,
        alignItems: 'center',
        justifyContent: 'center'
      }, appStyles.card]}>
        <Text style={{
          color: theme.colours.light,
          fontSize: 16,
          padding: 10
        }}>
          Oops! We couldn't load events. Pull on this card to try again.
        </Text>
      </View>
    );
  }
}