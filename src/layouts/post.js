import React from 'react';
import _ from 'lodash';
import moment from 'moment-strftime';

import { Layout } from '../components/index';
import { htmlToReact, withPrefix, markdownify } from '../utils';

export default class Post extends React.Component {
    render() {
        const data = _.get(this.props, 'data');
        const config = _.get(data, 'config');
        const page = _.get(this.props, 'page');
        const title = _.get(page, 'title');
        const subtitle = _.get(page, 'subtitle');
        const image = _.get(page, 'content_img_path');
        const imageAlt = _.get(page, 'content_img_alt', '');
        const date = _.get(page, 'date');
        const dateTimeAttr = date ? moment(date).strftime('%Y-%m-%d %H:%M') : '';
        const formattedDate = date ? moment(date).strftime('%B %d, %Y') : '';
        const markdownContent = _.get(page, 'markdown_content');

        return (
            <Layout page={page} config={config}>
                <article className="post post-full">
                    <header className="post-header">
                        <h1 className="post-title underline">{title}</h1>
                        {subtitle && <div className="post-subtitle">{htmlToReact(subtitle)}</div>}
                    </header>
                    {image && (
                        <div className="post-image">
                            <img src={withPrefix(image)} alt={imageAlt} />
                        </div>
                    )}
                    {markdownContent && <div className="post-content">{markdownify(markdownContent)}</div>}
                    <footer className="post-meta">
                        <time className="published" dateTime={dateTimeAttr}>{formattedDate}</time>
                    </footer>
                </article>
            </Layout>
        );
    }
}
