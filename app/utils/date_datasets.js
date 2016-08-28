import { last } from 'lodash';

function getParenthesisedGroups(str) {
    let nesting = 0,
        groupStart = -1,
        groups = [];

    for (let i = 0; i < str.length; i++) {
        if (str[i] === '(') {
            if (nesting === 0) {
                groupStart = i + 1;
            }

            nesting++;
        } else if (str[i] === ')') {
            nesting--;

            if (nesting === 0) {
                groups.push(str.substr(groupStart, i - groupStart));
                groupStart = -1;
            }
        }
    }

    // push unclosed last group to the result
    if (groupStart !== -1) {
        groups.push(str.substr(groupStart, str.length - groupStart));
    }

    return groups;
}

export function extractDateDataSetTitle(title) {
    return last(getParenthesisedGroups(title)) || title;
}
