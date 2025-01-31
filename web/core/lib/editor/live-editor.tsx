import React, { useEffect, useRef, useState } from 'react'

import { EditorContent, useEditor } from '@tiptap/react'
import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import { CharacterCount } from "@tiptap/extension-character-count";
import { useTranslation } from "react-i18next";

import MarkdownIt from 'markdown-it'
import { useDebounce } from 'use-debounce';

import { InlineCompletion } from "@/editor/extensions/inline-completion/inline-completion";
import { MenuBubble } from '@/editor/menu/menu-bubble'
import { createSlashExtension } from './extensions/slash-command/slash-extension'
import { createQuickBox } from '@/editor/extensions/quick-box/quick-box-extension'
import { AdviceExtension } from '@/editor/extensions/advice/advice-extension';

import TrackChangeExtension from '@/editor/extensions/diff/track-change-extension'
import { ToolbarMenu } from './menu/toolbar-menu'
import { CustomEditorCommands } from './action/custom-editor-commands'
import { Sidebar } from './components/sidebar'

import "./editor.css"
import { Advice } from "@/editor/extensions/advice/advice";
import { AdviceManager } from "@/editor/extensions/advice/advice-manager";
import { AdviceView } from "@/editor/extensions/advice/advice-view";
import { Settings } from "@/editor/components/settings";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

const md = new MarkdownIt()

const extensions: any = [
	// we define all commands here
	CustomEditorCommands,
	AdviceExtension.configure({
		HTMLAttributes: {
			class: "my-advice",
		},
		setAdviceCommand: (advice: Advice) => {
			AdviceManager.getInstance().addAdvice(advice);
		},
		onAdviceActivated: (adviceId) => {
			if (adviceId) AdviceManager.getInstance().setActiveId(adviceId);
		},
	}),
	TrackChangeExtension.configure({
		enabled: false,
	}),
	InlineCompletion,
	StarterKit.configure({
		bulletList: {
			keepMarks: true,
			keepAttributes: false,
		},
		orderedList: {
			keepMarks: true,
			keepAttributes: false,
		},
	}),
	createSlashExtension('ai-slash'),
	createQuickBox(),
	CharacterCount.configure({}),
	Color.configure({ types: [TextStyle.name, ListItem.name] }),
	// @ts-ignore
	TextStyle.configure({ types: [ListItem.name] }),
	Table,
	TableRow,
	TableCell,
	TableHeader
]

const LiveEditor = () => {
	const { t, i18n } = useTranslation();

	const editor = useEditor({
		extensions,
		content: md.render(t('Editor Placeholder')),
		editorProps: {
			attributes: {
				class: 'prose lg:prose-xl bb-editor-inner',
			},
		}
	})

	const [debouncedEditor] = useDebounce(editor?.state.doc.content, 2000);
	useEffect(() => {
		if (debouncedEditor) {
			console.info('todo: add save logic', debouncedEditor)
		}
	}, [debouncedEditor]);

	return <div className={'w-full flex editor-block'}>
		{editor && <div className={'lg:flex md:hidden sm:hidden hidden'}><Sidebar eidtor={editor}/></div>}

		<div className={'w-full editor-section'}>
			{editor && <Settings editor={editor}/>}
			{editor && <ToolbarMenu className={'toolbar-menu'} editor={editor}/>}
			<div className={'editor-main'}>
				<EditorContent editor={editor}/>
				<div>{editor && <MenuBubble editor={editor}/>}</div>

				{editor && <div className="character-count">
          <p className={'p-2'}>{editor.storage.characterCount.characters()} characters</p>
          <p className={'p-2'}>{editor.storage.characterCount.words()} words</p>
        </div>
				}
			</div>
		</div>
		{editor && <AdviceView editor={editor}/>}
	</div>
}

export default LiveEditor