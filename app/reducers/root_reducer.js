import AppContextReducer from './app_context_reducers';
import DataReducer from './data_reducer';
import DndReducer from './dnd_reducer';
import BucketsReducer from './buckets_reducer';
import BucketFiltersReducer from './bucket_filters_reducer';
import AttributeElementsReducer from './attribute_elements_reducer';
import ReportReducer from './report_reducer';
import SaveReducer from './save_reducer';
import OpenReducer from './open_reducer';
import DeleteReducer from './delete_reducer';
import MessagesReducer from './messages_reducer';
import ShortcutsReducer from './shortcuts_reducer';
import DialogsReducer from './dialogs_reducer';
import RecommendationsReducer from './recommendations_reducer';
import SortReducer from './sort_reducer';

import TimeTravelReducer from './time_travel_reducer';

import { compose } from '../utils/reducers';

const reducers = [
    TimeTravelReducer,
    AppContextReducer,
    DataReducer,
    DndReducer,
    BucketsReducer,
    BucketFiltersReducer,
    AttributeElementsReducer,
    ReportReducer,
    SaveReducer,
    OpenReducer,
    DeleteReducer,
    MessagesReducer,
    DialogsReducer,
    ShortcutsReducer,
    RecommendationsReducer,
    SortReducer
];

export default compose(reducers);
