import generateStories from '../../../../.storybook/generateStories';
import Table from './Table';

const cols = [
  {
    colId: 'title',
    displayName: 'Document title'
  },
  {
    colId: 'desc',
    displayName: 'Description'
  },
  {
    colId: 'Year'
  }
];

const tableData = [
  {
    title: 'Declaration of Independence',
    desc:
      'Statement adopted by the Continental Congress declaring independence from the British Empire.',
    Year: '1776'
  },
  {
    title: 'Bill of Rights',
    desc:
      'The first ten amendments of the U.S. Constitution guaranteeing rights and freedoms.',
    Year: '1791'
  },
  {
    title: 'Declaration of Sentiments',
    desc:
      'A document written during the Seneca Falls Convention outlining the rights that American women should be entitled to as citizens.',
    Year: '1848'
  }
];

generateStories({
  component: { Table },
  storyName: 'Elements | Table',
  defaultProps: {
    borderless: false
  },
  defaultChildren: [''],
  stories: [
    {
      name: 'Border (default)',
      props: {
        columns: cols,
        data: tableData
      }
    },
    {
      name: 'Borderless',
      props: {
        columns: cols,
        data: tableData,
        borderless: true
      }
    },
    {
      name: 'Table Caption',
      props: {
        columns: cols,
        data: tableData,
        caption: 'Table caption'
      }
    },
    {
      name: 'Borderless w/Caption',
      props: {
        columns: cols,
        data: tableData,
        caption: 'Table caption',
        borderless: true
      }
    }
  ]
});
