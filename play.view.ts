namespace $.$$ {
	
	declare var launchQueue: {
		setConsumer: ( consumer: ( params: { files: any[] } )=> void )=> void
	}
	
	type Entry = {
		title: string
		uri: string
	}
	
	export class $hyoo_play extends $.$hyoo_play {
		
		@ $mol_mem
		playlist() {
			return this.$.$mol_state_arg.value( 'playlist' ) ?? super.playlist()
		}
		
		@ $mol_mem
		playlist_files() {
			
			const uri = this.playlist()
			if( !uri ) return []
			
			const text = this.$.$mol_fetch.text( uri )
			
			const files = [ ... text.matchAll( $hyoo_play_m3u_entry ) ]
				.map( cap => cap.groups )
				.filter( $mol_guard_defined )
				.map( ({ title, uri })=> ({ title, uri }) )
				
			return files
		}
		
		@ $mol_mem
		files( next?: Entry[] ) : Entry[] {
			return next ?? this.playlist_files()
		}
		
		receive( transfer: DataTransfer ) {
			
			const files = [] as File[]
			
			function collect( file: File, entry: FileSystemEntry  ) {
				
				if( entry.isFile ) files.push( file )
				
				// if( entry.isDirectory ) {
					
				// 	const reader = ( entry as FileSystemDirectoryEntry ).createReader()
				// 	const more = ()=> {
				// 		reader.readEntries( res => {
							
				// 			if( !res.length ) return
							
				// 			for( const e of res ) {
				// 				;( e as FileSystemFileEntry ).file( f => {
				// 					collect( f, e )
				// 				} )
				// 			}
							
				// 			more()
							
				// 		} )
				// 	}
				// 	more()
					
				// }
				
			}
			
			for( const item of transfer.items ) {
				collect( item.getAsFile()!, item.webkitGetAsEntry()! )
			}
			
			this.files_add( files.sort( $mol_compare_text( file => file.name ) ) )
			
		}
		
		files_add( files: File[] ) {
			
			const entries = files.map( file => ({
				title: file.name.replace( /\.[^.]+$/, '' ),
				uri: URL.createObjectURL( file ),
			}) )
			
			this.files([ ... new Set([ ... this.files(), ... entries ]) ])
			
			if( !this.file_current() ) this.file_current( entries[0] )
			
			return files
		}
		
		// @ $mol_mem
		// file_current( next?: File ) {
		// 	return next ?? this.files()[ 0 ] ?? null
		// }
		
		@ $mol_mem
		queue_files() {
			return this.files().map( ( file , index )=> this.File( file ) )
		}
		
		file_title( file: Entry ) {
			return file.title
		}
		
		file_enabled( file: Entry ) {
			return file !== this.file_current()
		}
		
		file_play( file: Entry ) {
			this.file_current( file )
		}
		
		file_drop( file: Entry ) {
			this.files( this.files().filter( f => f !== file ) )
		}
		
		@ $mol_mem
		pages() {
			return [
				this.Queue(),
				... this.file_current() ? [ this.Player() ] : [],
			]
		}
		
		@ $mol_mem
		play_title() {
			const file = this.file_current()
			return file?.title.replace( /\.[^.]+$/, '' ) ?? ''
		}
		
		@ $mol_mem
		play_uri() {
			return this.file_current()?.uri ?? 'about:blank'
		}
		
		@ $mol_mem
		auto_switch() {
			
			if( this.files().length < 2 ) return null
			
			const player = this.Player()
			if( player.playing() ) return null
			if( player.time() !== player.duration() ) return null
			
			const files = this.files()
			let index = ( files.indexOf( this.file_current() ) + 1 ) % files.length
			
			new $mol_after_frame( ()=> {
				this.file_current( files[ index ] )
				player.playing( true )
			} )
			
			return null
		}
		
		@ $mol_mem
		handle_files() {
			if( typeof launchQueue === 'undefined' ) return null
			launchQueue.setConsumer( async( params )=> {
				const files = await Promise.all( [ ... params.files ].map( handle => handle.getFile() ) )
				this.files_add( files )
			} )
			return null
		}
		
		auto() {
			this.auto_switch()
			this.handle_files()
		}
		
	}
}
