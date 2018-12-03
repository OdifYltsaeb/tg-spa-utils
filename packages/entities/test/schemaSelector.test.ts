import { normalize } from 'normalizr';

import {
    createSchemaSelector,
    markArchived,
    setEntities,
} from '../src';

import { configureStore } from './createStore';
import { article, comment, generateArticles, generateComments, user } from './createTestData';


let store: ReturnType<typeof configureStore>;


beforeEach(() => {
    store = configureStore();
});


const pushDataToStore = (schema: any, data: any) => {
    const normalizedData = normalize(data, [schema]);

    store.dispatch(setEntities({
        key: schema.key,
        entities: normalizedData.entities,
        order: normalizedData.result,
    }));
};


describe('createSchemaSelector works', () => {
    test('root schema selector works', () => {
        const schemaSelector = createSchemaSelector(article);

        const data = generateArticles(15, 15);
        pushDataToStore(article, data);

        expect(schemaSelector(store.getState())).toEqual(data);
    });

    test('specific ids w/ archive', () => {
        const schemaSelector = createSchemaSelector(comment);

        const data = generateComments(15);
        pushDataToStore(comment, data);

        const ids = data.map((d) => d.id);

        const [skip, ...active] = ids;

        expect(schemaSelector(store.getState(), ...ids)).toEqual(data);

        store.dispatch(markArchived({ key: comment.key, ids: [skip] }));

        expect(schemaSelector(store.getState(), ...ids)).toEqual(data.filter((d) => active.includes(d.id)));
    });

    test('missing key returns empty', () => {
        const schemaSelector = createSchemaSelector(user);

        expect(schemaSelector(store.getState())).toEqual([]);
    });
});