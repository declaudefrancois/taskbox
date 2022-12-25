import React from 'react';

import {
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@storybook/testing-library';
import { rest } from 'msw';
import { Provider } from 'react-redux';
import store from '../lib/store';
import InboxScreen from './InboxScreen';
import { MockedState } from './TaskList.stories';

export default {
  component: InboxScreen,
  title: 'InboxScreen',
  decorators: [(story) => <Provider store={store}>{story()}</Provider>],
};

const Template = () => <InboxScreen />;

export const Default = Template.bind({});
Default.parameters = {
  msw: {
    handlers: [
      rest.get(
        'https://jsonplaceholder.typicode.com/todos?userId=1',
        async (req, res, ctx) => {
          const response = await new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(res(ctx.json(MockedState.tasks)))
            }, 300);
          });

          return response;
        }
      ),
    ],
  },
};

Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  // Waits for the component to transition from the loading state
  await waitForElementToBeRemoved(await canvas.findByTestId('loading'));
  // Waits for the component to be updated based on the store
  await waitFor(async () => {
    // Simulates pinning the first task
    await fireEvent.click(canvas.getByLabelText('pinTask-1'));
    // Simulates pinning the third task
    await fireEvent.click(canvas.getByLabelText('pinTask-3'));
  });
};

export const Error = Template.bind({});
Error.parameters = {
  msw: {
    handlers: [
      rest.get(
        'https://jsonplaceholder.typicode.com/todos?userId=1',
        async (req, res, ctx) => {
          const response = await new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(res(ctx.status(403)))
            }, 300);
          });

          return response;
        }
      ),
    ],
  },
};