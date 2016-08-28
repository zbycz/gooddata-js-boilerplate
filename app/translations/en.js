import { translation } from 'js-utils';

export default translation.flattenMessages({
    'of': 'of',
    'apply': 'Apply',
    'clear': 'Clear',
    'cancel': 'Cancel',
    'loading': 'Loading…',
    'search': 'Search…',
    'search_data': 'Search data…',
    'search_insights': 'Search all insights…',
    'metrics': 'Metrics',
    'categories': 'Category',
    'filters': 'Filters',
    'table': 'Table',
    'line': 'Line chart',
    'column': 'Column chart',
    'bar': 'Bar chart',
    'open_as_report': 'Open as Report',
    'export_unsupported': `
        Insight is not compatible with Report Editor.
        "{title}" is in configuration twice.
        Remove one {type} to Open as Report.
    `,
    'reset': 'Clear',
    'undo': 'Undo',
    'redo': 'Redo',
    'save': 'Save',
    'save_as_new': 'Save as new',
    'saving': 'Saving…',
    'based_on': 'Based on',
    'this_month': 'This month',
    'this_quarter': 'This quarter',
    'day': 'Day',
    'week': 'Week (Sun-Sat)',
    'quarter': 'Quarter',
    'month': 'Month',
    'year': 'Year',
    'previous_year': 'previous year',
    'select_all': 'Select all',
    'more': 'more',
    'all': 'All',
    'empty_value': 'empty value',
    'no_results_matched': 'No results matched',
    'unsaved_changes': 'Unsaved changes',
    'messages': {
        'connectionError': 'Connection failed, try again later…',
        'saveReportError': 'Failed to save insight, please try again.',
        'deleteReportSuccess': 'Great! We deleted your insight.',
        'deleteReportError': 'Failed to delete insight, please try again.',
        'saveReportSuccess': 'Great! We saved your insight.',
        'longSaving': 'Saving is taking longer than expected, please wait…'
    },
    'bucket_item_types': {
        'attribute': 'attribute',
        'date': 'date',
        'fact': 'measure',
        'metric': 'calculated measure'
    },
    'aggregations': {
        'title': {
            'SUM': 'Sum',
            'MIN': 'Minimum',
            'MAX': 'Maximum',
            'AVG': 'Average',
            'RUNSUM': 'Running sum',
            'MEDIAN': 'Median',
            'COUNT': 'Count'
        },

        'metric_title': {
            'COUNT': 'Count of {title}',
            'SUM': 'Sum of {title}',
            'MAX': 'Max {title}',
            'MIN': 'Min {title}',
            'AVG': 'Avg {title}',
            'RUNSUM': 'Runsum of {title}',
            'MEDIAN': 'Median {title}'
        }
    },
    'recommendation': {
        'comparison': {
            'compare': 'Compare',
            'percents': 'See percents',
            'contribution_compare': 'Compare',
            'with_same_period': 'to the same period in previous year',
            'between_each': 'between each',
            'contribution_to_the_whole': 'contribution to the whole'
        },
        'trending': {
            'see': 'See trend',
            'of_last_four_quarters': 'of last 4 quarters',
            'in_time_by': 'in time by'
        }
    },
    'date': {
        'timezoneHint': 'in {timezoneName} (UTC&nbsp;{offset})',
        'filter.dropdownTitle': '{dateDataSet}: {granularity}',

        'title.allTime': 'All time',

        'date-dataset': {
            'recommended': 'Recommended',
            'other': 'Other',
            'unrelated_hidden': '{count} unrelated {count, plural, =1 {date} other {dates}} hidden'
        },

        'floating': {
            title: {
                'single.this': 'This {unitTitle}',
                'single.last': 'Last {unitTitle}',
                'range.last': 'Last {unitCount} {unitTitle}'
            },
            'example': {
                'single': '{periodStart}',
                'range': '{periodStart} - {periodEnd}'
            }
        },

        'interval.title.single': '{periodStart}',
        'interval.title.range': '{periodStart} - {periodEnd}',

        'date': '{count, plural, =1 {day} other {days}}',
        'month': '{count, plural, =1 {month} other {months}}',
        'quarter': '{count, plural, =1 {quarter} other {quarters}}',
        'year': '{count, plural, =1 {year} other {years}}'
    },
    'filter': {
        'attribute.itemsLimitExceeded': 'All values or up to 500 specific values can be selected.',
        'date': {
            'presets': 'presets',
            'range': 'date range',
            'interval': {
                'between': 'Between',
                'and': 'and'
            },
            'date-dataset': {
                'is': 'is'
            }
        }
    },
    'catalogue': {
        'loading_availability': 'Fetching related data',
        'no_data_matching': 'No data matching',
        'no_objects_found': 'No objects found.',
        'unavailable_items_matched':
            '{count} unrelated data {count, plural, =1 {item} other {items}} hidden',
        'filter': {
            'all': 'all data',
            'metrics': 'measures',
            'attributes': 'attributes'
        }
    },
    'dashboard': {
        'computing': 'Computing…',
        'project_data': 'Project data',
        'bucket': {
            'metrics_add_placeholder': 'Drag <span class="metric-field-icon"></span> or <span class="attr-field-icon"></span> here',
            'metrics_dropzone_hint': 'Drag a measure or attribute from the Data Catalogue to add it here.',
            'categories_add_placeholder': 'Drag <span class="attr-field-icon"></span> or <span class="date-field-icon"></span> here',
            'categories_dropzone_hint': 'Drag an attribute or date from the Data Catalogue to add it here.',
            'drop': 'drop to add',
            'filters_add_placeholder': 'Drag <span class="attr-field-icon"></span> or <span class="date-field-icon"></span> here',
            'filters_dropzone_hint': 'Drag an attribute or date from the Data Catalogue to add it as a filter.',
            'stacks_add_placeholder': 'Drag <span class="attr-field-icon"></span> here',
            'stacks_dropzone_hint': 'Drag an attribute from the Data Catalogue to add it here.',
            'metrics_title': {
                'table': 'Measures',
                'column': 'Measures',
                'bar': 'Measures',
                'line': 'Measures'
            },
            'categories_title': {
                'table': 'Attributes',
                'column': 'View by',
                'bar': 'View by',
                'line': 'Trend by'
            },
            'stacks_title': {
                'column': 'Stack by',
                'bar': 'Stack by',
                'line': 'Segment by'
            },
            'metric_segment_by_warning': 'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">segment by</span>',
            'metric_stack_by_warning': 'To add additional measure, remove <span class="attr-field-icon"></span> from <span class="stack-by">stack by</span>',
            'category_stack_by_warning': 'To stack by, an insight can have only one measure',
            'category_segment_by_warning': 'To segment by, an insight can have only one measure',
            'add_attribute_filter': 'Add attribute filter'
        },
        'bucket_item': {
            'as': 'as',
            'granularity': 'group by',
            'show_contribution': 'show in %',
            'show_pop': 'compare to the same period in previous year',
            'replace': 'Drop to replace',
            'no_date_available_category': 'Measure cannot be trended',
            'no_date_available_filter': 'Date'
        },
        'attribute_filter': {
            'only': 'only'
        },
        'catalogue_item': {
            'type': 'type',
            'defined_as': 'defined as',
            'values': 'values',
            'dataset': 'dataset',
            'empty_value': '(empty value)',
            'shortening_decoration': '…and {count} more',
            'common_date_description': 'Represents all your dates in project. Can group by Day, Week, Month, Quarter & Year.'
        },
        'message': {
            'blank': {
                'header': 'Get started',
                'description': 'Drag data here{br}to begin.'
            },
            'invalid_configuration': {
                'header': 'Sorry, we can\'t display this insight',
                'description': 'Try applying different filters, or using different measures or attributes.{br}If this did not help, contact your administrator.'
            },
            'missing_metric': {
                'header': 'No measure in your insight',
                'description': 'Add a measure to your insight, or {switch_to_table}.{br}Once done, you\'ll be able to save it.',
                'switch_to_table': 'switch to table view'
            },
            'empty': {
                'header': 'No data for your filter selection',
                'description': 'Try adjusting or removing some of the filters.'
            },
            'too_large_to_display': {
                'header': 'Too many data points to display',
                'description': 'Add a filter, or {switch_to_table}.',
                'switch_to_table': 'switch to table view'
            },
            'too_large_to_compute': {
                'header': 'Too many data points to display',
                'description': 'Try applying one or more filters.'
            }
        },
        'recommendation.recommended_next_steps': 'RECOMMENDED NEXT STEPS',
        'recommendation.recommended_steps': 'RECOMMENDED STEPS',
        'trash.hint': 'Drop to remove'
    },
    'shortcut': {
        'metric_over_time': 'See "{decoratedTitle}" <strong>trending</strong> over time',
        'single_attribute': '<strong>List</strong> of "{decoratedTitle}" values',
        'computing_recommendation': '<strong>Computing</strong> recommendation…',
        'measure_cant_be_trended': 'This measure can\'t be trended.',
        'single_metric': `
            See "{decoratedTitle}"<br>
            as a <strong>column chart</strong>
        `
    },
    'header': {
        'kpis': 'KPIs',
        'dashboards': 'Dashboards',
        'analyze': 'Analyze',
        'reports': 'Reports',
        'manage': 'Manage',
        'load': 'Load',
        'account': 'Account',
        'dic': 'Data integration console',
        'logout': 'Logout'
    },
    'error': {
        'project': {
            'not_found': {
                message: 'Project `{projectId}` not found.',
                description: ' '
            },
            'access': {
                message: 'Sorry, you don\'t have access to this project.',
                description: 'Ask project administrator to send you an invitation.'
            }
        },
        'no_project_available': {
            message: 'No available project found.',
            description: ' '
        },
        'access': {
            message: 'Sorry, you don\'t have access to this page.',
            description: 'Ask your administrator to grant you permissions.'
        },
        'general': {
            message: 'Project `{projectId}` error',
            description: ' '
        }
    },
    'csv_uploader': {
        'add_data_link': 'Add data',
        'add_data_title': {
            'upload': 'Upload a CSV file to add new',
            'analyze': 'data for analyzing.'
        }
    },
    'datasets': {
        'production_data': 'Production data',
        'user': 'My data',
        'shared': 'Other users\' data',
        'csv_hint': 'You can also analyze CSV data.',
        'upload_file': 'Load your file here'
    },
    visualizationsList: {
        savedVisualizations: 'Saved insights',
        noVisualizations: 'No insights saved.',
        noVisualizationsFound: 'No insight matched.',
        at: 'at',
        tabs: {
            all: 'all',
            my: 'created by me'
        },
        yesterday: 'Yesterday',
        today: 'Today',
        loading: 'Loading…'
    },

    dropdown: {
        loading: 'Loading…'
    },

    openReportPlaceholder: 'Open',

    dialogs: {
        openReportConfirmation: {
            headline: 'Discard unsaved changes?',
            description: 'All unsaved changes will be lost',
            confirm: 'Discard changes',
            cancel: 'Cancel'
        },
        deleteReportConfirmation: {
            headline: 'Delete saved insight?',
            description: 'You will loose your insight <strong>{deletedReportTitle}</strong> for&nbsp;good.',
            confirm: 'Delete insight',
            cancel: 'Cancel'
        },
        savingUntitledReportConfirmation: {
            headline: 'Name your insight',
            description: 'Give your new insight a new descriptive name, so it\'s easier to find it later on.',
            placeholder: 'Untitled insight',
            confirm: 'Save',
            cancel: 'Cancel'
        }
    },
    export: {
        defaultRdTitle: 'Untitled report definition'
    }
});
